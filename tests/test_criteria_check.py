from conftest import DATA_DIR

from coursebarvaz.backtest import load_events
from coursebarvaz.criteria_check import check, load_preevent
from coursebarvaz.models import Company, Market
from coursebarvaz.criteria_check import PreEventFundamentals


def test_preevent_loads():
    pe = load_preevent(DATA_DIR / "preevent_fundamentals.csv")
    assert "JP-TAISHO-2023" in pe
    assert pe["JP-DOCOMO-2020"].company.market == Market.JAPAN


class TestCaptureOnRealData:
    def _run(self):
        return check(load_events(DATA_DIR / "historical_events.csv"),
                     load_preevent(DATA_DIR / "preevent_fundamentals.csv"))

    def test_strict_criteria_miss_every_reconstructed_event(self):
        # The documented finding: the current gate catches none of them.
        outcomes = self._run()
        assert outcomes and all(not o.met_criteria for o in outcomes)

    def test_taisho_misses_only_on_listed_parent(self):
        # Deep-value + cash-rich, but an MBO -> excluded by the Oyako-Jojo gate.
        o = next(o for o in self._run() if o.event_id == "JP-TAISHO-2023")
        assert o.failed_gates == ["Listed parent"]

    def test_docomo_misses_on_valuation_and_cash(self):
        o = next(o for o in self._run() if o.event_id == "JP-DOCOMO-2020")
        assert "P/B discount" in o.failed_gates
        assert "Net-cash cushion" in o.failed_gates


def test_a_qualifying_company_is_reported_as_met():
    # Sanity check the machinery: a genuinely qualifying Japan setup passes.
    from coursebarvaz.backtest import Event

    good = Company(ticker="G", name="Good Sub", market=Market.JAPAN,
                   market_cap=100, book_value=200, cash_and_equivalents=60,
                   total_debt=5, net_income=8, operating_income=9,
                   has_listed_parent=True, parent_ticker="9999.T",
                   parent_ownership_pct=0.55)
    events = [Event(event_id="E", ticker="G", name="Good Sub", market="JP",
                    category="parent_buyout", counterparty="P",
                    announce_date="2024-01-01", resolve_date="2024-03-01",
                    outcome="completed", offer_price=150, premium_1d=0.5,
                    premium_early=0.5, holding_days=60)]
    pe = {"E": PreEventFundamentals("E", good, "2023-12", "test", "")}
    outcomes = check(events, pe)
    assert outcomes[0].met_criteria

from conftest import DATA_DIR

from coursebarvaz.backtest import Event, load_events, run_backtest


def _ev(**kw) -> Event:
    base = dict(
        event_id="X", ticker="X", name="X", market="JP", category="parent_buyout",
        counterparty="P", announce_date="2020-01-01", resolve_date="2020-04-01",
        outcome="completed", offer_price=100.0, premium_1d=0.10, premium_early=0.50,
        holding_days=90.0, notes="",
    )
    base.update(kw)
    return Event(**base)


def test_captured_return_prefers_early_premium():
    assert _ev(premium_early=0.5, premium_1d=0.1).captured_return == 0.5
    assert _ev(premium_early=None, premium_1d=0.1).captured_return == 0.1
    assert _ev(outcome="failed").captured_return is None


def test_annualized_scales_with_holding_period():
    fast = _ev(premium_early=0.5, holding_days=90)
    slow = _ev(premium_early=0.5, holding_days=365)
    assert fast.annualized > slow.annualized
    # A 50% gain held exactly one year annualizes to ~50%.
    assert abs(slow.annualized - 0.5) < 1e-6


def test_annualized_none_without_holding():
    assert _ev(holding_days=None).annualized is None


class TestOnRealEvents:
    def _events(self):
        return load_events(DATA_DIR / "historical_events.csv")

    def test_dataset_loads_with_failures_and_successes(self):
        events = self._events()
        outcomes = {e.outcome for e in events}
        assert "completed" in outcomes and "failed" in outcomes
        assert len(events) >= 8

    def test_win_rate_and_positive_edge(self):
        rep = run_backtest(self._events())
        assert 0.0 < rep.win_rate <= 1.0
        # Early entry beat news-day entry on the deals reporting both premiums.
        assert rep.early_edge is not None and rep.early_edge > 0

    def test_failed_events_have_no_captured_return(self):
        failed = [e for e in self._events() if not e.completed]
        assert failed and all(e.captured_return is None for e in failed)

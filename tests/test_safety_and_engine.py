from conftest import DATA_DIR

from coursebarvaz.config import DEFAULT
from coursebarvaz.engine import ScanEngine
from coursebarvaz.models import Company, Market, Metrics
from coursebarvaz.providers.csv_provider import CsvProvider
from coursebarvaz.safety import SafetyEvaluator


def company(**kw) -> Company:
    base = dict(
        ticker="X", name="X", market=Market.INDIA,
        market_cap=100.0, book_value=50.0, cash_and_equivalents=30.0,
        total_debt=5.0, net_income=10.0, operating_income=12.0,
        promoter_holding_pct=0.735, pledged_shares_pct=0.0,
    )
    base.update(kw)
    return Company(**base)


class TestSafetyGate:
    gate = SafetyEvaluator(DEFAULT.safety)

    def test_clean_balance_sheet_passes(self):
        c = company()
        ok, _ = self.gate.evaluate(c, Metrics.of(c))
        assert ok

    def test_pledged_shares_veto(self):
        c = company(pledged_shares_pct=0.15)
        ok, _ = self.gate.evaluate(c, Metrics.of(c))
        assert not ok

    def test_net_debt_veto(self):
        c = company(cash_and_equivalents=5, total_debt=50)
        ok, _ = self.gate.evaluate(c, Metrics.of(c))
        assert not ok

    def test_operating_loss_veto(self):
        c = company(operating_income=-1)
        ok, _ = self.gate.evaluate(c, Metrics.of(c))
        assert not ok


class TestEngineOnSampleData:
    engine = ScanEngine()

    def _provider(self):
        return CsvProvider(DATA_DIR / "japan_sample.csv", DATA_DIR / "india_sample.csv")

    def test_qualified_are_expected_tickers(self):
        results = self.engine.scan(self._provider())
        qualified = {r.company.ticker for r in results if r.qualified}
        # Two clean Japanese subs + two clean Indian promoter-creep names.
        assert qualified == {"0001.T", "0002.T", "AAA.NS", "BBB.NS"}

    def test_results_sorted_by_score_desc(self):
        results = [r for r in self.engine.scan(self._provider()) if r.qualified]
        scores = [r.score for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_market_filter(self):
        results = self.engine.scan(self._provider(), market=Market.JAPAN)
        assert all(r.company.market == Market.JAPAN for r in results)

    def test_include_rejected_returns_everything(self):
        all_results = self.engine.scan(self._provider(), include_rejected=True)
        assert len(all_results) == 12  # 6 JP + 6 IN sample rows

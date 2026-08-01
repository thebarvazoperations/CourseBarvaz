from coursebarvaz.config import DEFAULT
from coursebarvaz.models import Company, Market, Metrics
from coursebarvaz.scanners.india import IndiaPromoterScanner
from coursebarvaz.scanners.japan import JapanOyakoScanner


def jp(**kw) -> Company:
    base = dict(
        ticker="0001.T", name="Sub", market=Market.JAPAN,
        market_cap=100.0, book_value=200.0, cash_and_equivalents=60.0,
        total_debt=5.0, net_income=8.0, operating_income=9.0,
        has_listed_parent=True, parent_ticker="9001.T", parent_ownership_pct=0.53,
    )
    base.update(kw)
    return Company(**base)


def in_(**kw) -> Company:
    base = dict(
        ticker="AAA.NS", name="Creep", market=Market.INDIA,
        market_cap=100.0, book_value=50.0, cash_and_equivalents=30.0,
        total_debt=5.0, net_income=10.0, operating_income=12.0,
        promoter_holding_pct=0.735, pledged_shares_pct=0.0,
    )
    base.update(kw)
    return Company(**base)


class TestJapan:
    scanner = JapanOyakoScanner(DEFAULT.japan)

    def test_ideal_candidate_qualifies(self):
        c = jp()
        ok, signals = self.scanner.evaluate(c, Metrics.of(c))
        assert ok, [str(s) for s in signals]

    def test_expensive_rejected(self):
        c = jp(market_cap=200, book_value=210)  # P/B ~0.95 > 0.8
        ok, _ = self.scanner.evaluate(c, Metrics.of(c))
        assert not ok

    def test_thin_cash_rejected(self):
        c = jp(cash_and_equivalents=20, total_debt=5)  # net cash 15% of mcap
        ok, _ = self.scanner.evaluate(c, Metrics.of(c))
        assert not ok

    def test_no_listed_parent_rejected(self):
        c = jp(has_listed_parent=False, parent_ticker=None, parent_ownership_pct=None)
        ok, _ = self.scanner.evaluate(c, Metrics.of(c))
        assert not ok

    def test_deeper_discount_scores_higher(self):
        cheap = jp(market_cap=100, book_value=250)   # P/B 0.4
        less = jp(market_cap=100, book_value=140)     # P/B ~0.71
        assert self.scanner.score(cheap, Metrics.of(cheap)) > self.scanner.score(less, Metrics.of(less))


class TestIndia:
    scanner = IndiaPromoterScanner(DEFAULT.india)

    def test_in_band_qualifies(self):
        c = in_(promoter_holding_pct=0.735)
        ok, signals = self.scanner.evaluate(c, Metrics.of(c))
        assert ok, [str(s) for s in signals]

    def test_below_band_rejected(self):
        c = in_(promoter_holding_pct=0.68)
        ok, _ = self.scanner.evaluate(c, Metrics.of(c))
        assert not ok

    def test_above_ceiling_rejected(self):
        c = in_(promoter_holding_pct=0.80)
        ok, _ = self.scanner.evaluate(c, Metrics.of(c))
        assert not ok

    def test_overvalued_rejected(self):
        c = in_(market_cap=1000, book_value=100)  # P/B 10 > 3
        ok, _ = self.scanner.evaluate(c, Metrics.of(c))
        assert not ok

    def test_closer_to_ceiling_scores_higher(self):
        near = in_(promoter_holding_pct=0.748)
        far = in_(promoter_holding_pct=0.722)
        assert self.scanner.score(near, Metrics.of(near)) > self.scanner.score(far, Metrics.of(far))

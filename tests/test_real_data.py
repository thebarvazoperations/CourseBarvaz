"""Smoke tests for the hand-verified real seed dataset.

These deliberately avoid hard-coding sourced *values* (which change as the
dataset is refreshed) and instead check that the files parse, cover both
markets, and flow through the engine — plus the one structural fact that
anchors the seed: Sun TV Network qualifies.
"""

from conftest import DATA_DIR

from coursebarvaz.engine import ScanEngine
from coursebarvaz.models import Market
from coursebarvaz.providers.csv_provider import CsvProvider


def _provider():
    return CsvProvider(DATA_DIR / "real_india.csv", DATA_DIR / "real_japan.csv")


def test_real_files_parse_and_cover_both_markets():
    companies = list(_provider().companies())
    markets = {c.market for c in companies}
    assert Market.INDIA in markets and Market.JAPAN in markets
    assert len(companies) >= 4


def test_engine_runs_on_real_data():
    results = ScanEngine().scan(_provider(), include_rejected=True)
    # Every real row is evaluated by a market-matched scanner.
    assert len(results) == len(list(_provider().companies()))


def test_sun_tv_is_a_qualified_anchor():
    results = ScanEngine().scan(_provider())
    qualified = {r.company.ticker for r in results}
    assert "SUNTV.NS" in qualified

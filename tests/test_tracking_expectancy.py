import json

from conftest import DATA_DIR

from coursebarvaz.backtest import load_events
from coursebarvaz.expectancy import compute_expectancy
from coursebarvaz.models import Company, Market, Metrics, ScanResult
from coursebarvaz.tracking import Setup, Snapshot, SnapshotStore


def _result(ticker: str, qualified: bool, score: float) -> ScanResult:
    c = Company(ticker=ticker, name=ticker, market=Market.JAPAN,
                market_cap=100.0, book_value=200.0)
    return ScanResult(company=c, metrics=Metrics.of(c), scanner="japan-oyako-jojo",
                      qualified=qualified, score=score)


class TestSnapshotStore:
    def test_save_and_reload_roundtrip(self, tmp_path):
        store = SnapshotStore(tmp_path)
        snap = Snapshot.from_results(
            [_result("A.T", True, 50), _result("B.T", False, 0)], as_of="2024-01-01")
        store.save(snap)
        reloaded = store.load_all()
        assert len(reloaded) == 1
        # Only the qualified setup is recorded.
        assert reloaded[0].tickers == {"A.T"}

    def test_first_flagged_uses_earliest_snapshot(self, tmp_path):
        store = SnapshotStore(tmp_path)
        store.save(Snapshot("2023-06-01", [Setup("X.T", "X", "JP", "s", 1.0)]))
        store.save(Snapshot("2022-06-01", [Setup("X.T", "X", "JP", "s", 1.0)]))
        first = store.first_flagged()
        assert first["X.T"][0] == "2022-06-01"

    def test_saved_file_is_valid_json(self, tmp_path):
        store = SnapshotStore(tmp_path)
        path = store.save(Snapshot.from_results([_result("A.T", True, 50)], as_of="2024-01-01"))
        json.loads(path.read_text(encoding="utf-8"))  # must not raise


class TestExpectancy:
    def _store(self, tmp_path, tickers):
        store = SnapshotStore(tmp_path)
        setups = [Setup(t, t, "JP", "s", 50.0) for t in tickers]
        store.save(Snapshot("2021-01-15", setups))
        return store

    def test_hit_miss_split_and_ticker_normalization(self, tmp_path):
        # '5486' should match the event ticker '5486.T' across the suffix.
        store = self._store(tmp_path, ["5486", "NOEVENT.T"])
        rep = compute_expectancy(store, load_events(DATA_DIR / "historical_events.csv"),
                                 horizon_days=1095)
        assert rep.n_setups == 2
        assert rep.n_hits == 1 and rep.n_misses == 1
        assert rep.hit_rate == 0.5

    def test_event_outside_horizon_is_a_miss(self, tmp_path):
        store = self._store(tmp_path, ["5486.T"])  # event announced 2021-04-28
        rep = compute_expectancy(store, load_events(DATA_DIR / "historical_events.csv"),
                                 horizon_days=30)  # too short to reach the event
        assert rep.n_hits == 0 and rep.n_misses == 1

    def test_blended_expectancy_dilutes_toward_misses(self, tmp_path):
        events = load_events(DATA_DIR / "historical_events.csv")
        one_hit = compute_expectancy(self._store(tmp_path / "a", ["5486.T"]), events)
        with_misses = compute_expectancy(
            self._store(tmp_path / "b", ["5486.T", "X.T", "Y.T"]), events)
        # Same winner, but three setups instead of one -> lower blended expectancy.
        assert with_misses.blended_expectancy < one_hit.blended_expectancy

    def test_miss_return_assumption_flows_through(self, tmp_path):
        events = load_events(DATA_DIR / "historical_events.csv")
        store = self._store(tmp_path, ["NOEVENT.T"])
        rep = compute_expectancy(store, events, miss_return=-0.10)
        assert rep.blended_expectancy == -0.10

"""Offline tests for scripts/compute_real_returns.py (no network / no yfinance)."""

import importlib.util
from datetime import date
from pathlib import Path

from conftest import DATA_DIR

from coursebarvaz.backtest import load_events

_SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "compute_real_returns.py"


def _load():
    spec = importlib.util.spec_from_file_location("compute_real_returns", _SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class _TS:
    def __init__(self, d):
        self._d = d

    def date(self):
        return self._d


class _Hist:
    def __init__(self, rows):
        self._rows = rows

    def __len__(self):
        return len(self._rows)

    def iterrows(self):
        for d, c in self._rows:
            yield _TS(d), {"Close": c}


def test_date_parsing():
    m = _load()
    assert m._d("2020-09-29") == date(2020, 9, 29)
    assert m._d("") is None
    assert m._d("nonsense") is None


def test_price_near_picks_closest_in_window():
    m = _load()
    hist = _Hist([(date(2020, 9, 25), 100.0), (date(2020, 9, 28), 103.0),
                  (date(2020, 10, 5), 90.0)])
    assert m._price_near(hist, date(2020, 9, 29)) == ("2020-09-28", 103.0)


def test_price_near_returns_none_outside_window():
    m = _load()
    hist = _Hist([(date(2020, 9, 25), 100.0)])
    assert m._price_near(hist, date(2021, 1, 1)) is None


def test_patch_events_is_a_valid_drop_in(tmp_path):
    m = _load()
    rows = [
        {"event_id": "JP-DOCOMO-2020", "status": "ok", "return_early": "0.62", "return_news": "0.35"},
        {"event_id": "JP-TAISHO-2023", "status": "missing", "return_early": "", "return_news": ""},
    ]
    out = tmp_path / "patched.csv"
    n = m.patch_events(DATA_DIR / "historical_events.csv", rows, out)
    assert n == 1  # only the 'ok' row is patched

    events = {e.event_id: e for e in load_events(out)}
    assert abs(events["JP-DOCOMO-2020"].premium_early - 0.62) < 1e-9
    assert abs(events["JP-DOCOMO-2020"].premium_1d - 0.35) < 1e-9
    # An untouched event keeps its original reported premium.
    assert abs(events["JP-HMETALS-2021"].premium_early - 0.745) < 1e-9

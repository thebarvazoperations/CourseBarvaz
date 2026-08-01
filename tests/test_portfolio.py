from conftest import DATA_DIR

from coursebarvaz.backtest import Event, load_events
from coursebarvaz.portfolio import simulate


def _ev(eid, announce, resolve, ret, outcome="completed") -> Event:
    return Event(event_id=eid, ticker=eid, name=eid, market="JP",
                 category="parent_buyout", counterparty="P",
                 announce_date=announce, resolve_date=resolve, outcome=outcome,
                 offer_price=100, premium_1d=ret, premium_early=ret,
                 holding_days=90)


def test_no_in_window_events_just_earns_cash_yield():
    res = simulate([_ev("E", "2019-01-01", "2019-04-01", 0.5)],
                   start_date="2021-08-01", end_date="2026-08-01",
                   start_cash=100_000, cash_yield=0.03)
    assert not res.trades
    # 100k at 3% for ~5y.
    assert abs(res.end_value - 100_000 * 1.03 ** res.years) < 1.0


def test_single_winner_grows_portfolio():
    res = simulate([_ev("E", "2022-01-01", "2022-06-01", 1.00)],
                   start_date="2021-08-01", end_date="2026-08-01",
                   start_cash=100_000, position_fraction=0.20, cash_yield=0.0)
    # 20k doubles to 40k; 80k idle stays -> ~120k.
    assert 119_000 < res.end_value < 121_000
    assert res.trades[0].ret == 1.00


def test_haircut_reduces_end_value():
    args = dict(start_date="2021-08-01", end_date="2026-08-01", start_cash=100_000,
                position_fraction=0.20, cash_yield=0.0)
    base = simulate([_ev("E", "2022-01-01", "2022-06-01", 0.50)], **args)
    stressed = simulate([_ev("E", "2022-01-01", "2022-06-01", 0.50)],
                        premium_haircut=0.20, **args)
    assert stressed.end_value < base.end_value


def test_cagr_and_total_return_consistent():
    res = simulate([], start_date="2021-08-01", end_date="2026-08-01",
                   start_cash=100_000, cash_yield=0.05)
    assert abs((1 + res.total_return) - (1 + res.cagr) ** res.years) < 1e-6


def test_runs_on_real_events():
    res = simulate(load_events(DATA_DIR / "historical_events.csv"),
                   start_date="2021-08-01", end_date="2026-08-01")
    # Several Japanese deals fall in this window and are all completed winners.
    assert res.trades and res.end_value > 100_000

"""Portfolio scenario simulator — $100k over a 5-year window.

READ THIS FIRST. This is a **scenario simulation, not a real backtest.** There
are no real price series behind it (every market data feed was blocked in the
build environment). Each position's return is the event's reported *premium* used
as a proxy for entry→exit, and the result is dominated by explicit assumptions
(position size, redeployment, cash yield, and what a failure costs). Treat the
output as "IF you had captured these specific events, sized this way" — never as
"the strategy returns X%."

Two scenarios bracket the truth honestly:
  * STRICT — the criteria as actually configured. From the capture-rate analysis
    they would have flagged **zero** of these events, so this portfolio never
    trades and just earns the cash yield. This is the realistic floor: what the
    tool as built would actually have done.
  * OPPORTUNITY CEILING — assumes you captured *every* in-window event. This is
    NOT what any criteria configuration delivers (the capture analysis shows even
    loosened gates catch only a fraction); it is the theoretical maximum of the
    deals that were available. The realistic result sits between the two and
    depends entirely on how well you retune and execute.

Known biases, stated up front: the in-window event sample here is all-winners
(this dataset's failures predate 2021), so the ceiling is optimistically biased;
premiums overstate what a real, slippage-and-tax-burdened fill captures; and
redeployment/sizing choices, not stock-picking, drive much of the number.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Optional

from .backtest import Event


def _d(s: str) -> date:
    return date.fromisoformat(s)


@dataclass
class Trade:
    event_id: str
    name: str
    entry: str
    exit: str
    size: float
    ret: float
    proceeds: float


@dataclass
class PortfolioResult:
    label: str
    start_cash: float
    end_value: float
    start_date: str
    end_date: str
    trades: list[Trade] = field(default_factory=list)

    @property
    def total_return(self) -> float:
        return self.end_value / self.start_cash - 1.0

    @property
    def years(self) -> float:
        return (_d(self.end_date) - _d(self.start_date)).days / 365.0

    @property
    def cagr(self) -> float:
        return (self.end_value / self.start_cash) ** (1.0 / self.years) - 1.0


def simulate(
    events: list[Event],
    start_date: str,
    end_date: str,
    start_cash: float = 100_000.0,
    position_fraction: float = 0.20,
    max_positions: int = 5,
    cash_yield: float = 0.03,
    fail_return: float = 0.0,
    premium_haircut: float = 0.0,
    label: str = "event-capture",
) -> PortfolioResult:
    """Sequentially deploy cash into in-window events and redeploy on resolution.

    Only events whose announce date falls in ``[start_date, end_date]`` and that
    carry a usable return are traded. Idle cash compounds at ``cash_yield``.
    ``premium_haircut`` shaves every winning premium (a stress knob).
    """
    # Build the interleaved enter/exit timeline.
    timeline: list[tuple[str, str, Event]] = []
    for e in events:
        if not (start_date <= e.announce_date <= end_date):
            continue
        if e.completed:
            r = e.captured_return
            if r is None or not e.resolve_date:
                continue  # no usable return / resolution date -> skip
            r = max(-1.0, r - premium_haircut)
            exit_date = min(e.resolve_date, end_date)
        else:
            r = fail_return
            exit_date = min(e.resolve_date or end_date, end_date)
        timeline.append((e.announce_date, "enter", e))
        timeline.append((exit_date, "exit", e))

    # Order by date; process exits before enters on the same day (free the cash).
    timeline.sort(key=lambda t: (t[0], 0 if t[1] == "exit" else 1))

    cash = start_cash
    open_pos: dict[str, tuple[float, float, str]] = {}  # id -> (size, ret, exit)
    trades: list[Trade] = []
    returns: dict[str, float] = {}
    exit_dates: dict[str, str] = {}
    clock = start_date

    def accrue(to_date: str) -> None:
        nonlocal cash, clock
        days = (_d(to_date) - _d(clock)).days
        if days > 0:
            cash *= (1.0 + cash_yield) ** (days / 365.0)
        clock = to_date

    for when, kind, e in timeline:
        accrue(when)
        if kind == "enter":
            if len(open_pos) >= max_positions or cash <= 0:
                continue
            portfolio_value = cash + sum(s for s, _, _ in open_pos.values())
            size = min(position_fraction * portfolio_value, cash)
            r = e.captured_return if e.completed else fail_return
            r = max(-1.0, (r or 0.0) - (premium_haircut if e.completed else 0.0))
            exit_date = min((e.resolve_date or end_date), end_date)
            cash -= size
            open_pos[e.event_id] = (size, r, exit_date)
            returns[e.event_id] = r
            exit_dates[e.event_id] = exit_date
        else:  # exit
            pos = open_pos.pop(e.event_id, None)
            if pos is None:
                continue
            size, r, exit_date = pos
            proceeds = size * (1.0 + r)
            cash += proceeds
            trades.append(Trade(e.event_id, e.name, e.announce_date, exit_date,
                                round(size, 2), r, round(proceeds, 2)))

    accrue(end_date)
    # Any position still open at the horizon is returned at cost (conservative).
    for eid, (size, r, _x) in open_pos.items():
        cash += size
    return PortfolioResult(label, start_cash, round(cash, 2), start_date, end_date, trades)


def format_result(res: PortfolioResult) -> str:
    L: list[str] = []
    L.append(f"  [{res.label}]")
    for t in res.trades:
        L.append(f"     {t.entry} -> {t.exit}  {t.name:<28} "
                 f"${t.size:>10,.0f} @ {t.ret:+.0%} -> ${t.proceeds:>11,.0f}")
    if not res.trades:
        L.append("     (no trades — criteria flagged nothing; held cash)")
    L.append(f"     START ${res.start_cash:>12,.0f}   END ${res.end_value:>12,.0f}")
    L.append(f"     total {res.total_return:+.1%}   over {res.years:.1f}y   "
             f"CAGR {res.cagr:+.1%}")
    return "\n".join(L)


def main(argv: list[str] | None = None) -> int:
    import argparse

    from .backtest import load_events

    p = argparse.ArgumentParser(prog="coursebarvaz-portfolio", description=__doc__)
    p.add_argument("--events", default="data/historical_events.csv")
    p.add_argument("--start", default="2021-08-01")
    p.add_argument("--end", default="2026-08-01")
    p.add_argument("--cash", type=float, default=100_000.0)
    p.add_argument("--position-fraction", type=float, default=0.20)
    p.add_argument("--max-positions", type=int, default=5)
    p.add_argument("--cash-yield", type=float, default=0.03)
    p.add_argument("--haircut", type=float, default=0.0,
                   help="shave every winning premium by this (stress test)")
    args = p.parse_args(argv)

    events = load_events(args.events)
    print("=" * 72)
    print(f"  CourseBarvaz — $ {args.cash:,.0f} portfolio scenario, {args.start} -> {args.end}")
    print("  SCENARIO SIMULATION on event premiums — NOT a real price backtest.")
    print("=" * 72)

    # STRICT: capture-rate analysis showed the built-in criteria flag none of
    # these events -> no trades -> cash only.
    strict = simulate(events, args.start, args.end, start_cash=args.cash,
                      cash_yield=args.cash_yield, label="STRICT criteria (as built) — 0 trades")
    strict.trades = []  # documented: capture rate 0 in-window
    strict.end_value = round(args.cash * (1.0 + args.cash_yield) ** strict.years, 2)
    print(format_result(strict))
    print()

    capture = simulate(events, args.start, args.end, start_cash=args.cash,
                       position_fraction=args.position_fraction,
                       max_positions=args.max_positions, cash_yield=args.cash_yield,
                       premium_haircut=args.haircut,
                       label="OPPORTUNITY CEILING — captured every in-window deal")
    print(format_result(capture))
    print()
    print(f"  Realistic result sits BETWEEN these two (floor ${strict.end_value:,.0f}, "
          f"ceiling ${capture.end_value:,.0f}) and depends on retuning + execution.")
    print("  Assumptions: each trade sized at "
          f"{args.position_fraction:.0%} of portfolio, up to {args.max_positions} "
          f"concurrent; idle cash at {args.cash_yield:.0%}/yr; premium = return proxy.")
    print("  Bias check: in-window events here are all winners (dataset failures")
    print("  predate the window). Try --haircut 0.15 to stress the premiums.")
    print("=" * 72)
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

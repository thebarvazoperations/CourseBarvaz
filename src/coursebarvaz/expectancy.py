"""Expectancy engine — turn flagged setups + realized events into a real number.

This is the piece the historical backtest could not give you: a *blended*
expectancy per setup that includes the misses. It joins two sources:

  * the snapshot store (every setup the screener flagged, and when) — the
    denominator; and
  * the historical events (which of those setups actually got an event, and what
    it paid) — the numerator.

For each setup, first flagged at date D, it looks for an event on the same ticker
announced within ``horizon_days`` of D:
  * completed event  -> return = the event's captured (early) return;
  * failed event     -> return = ``fail_return`` (default 0.0);
  * no event in time  -> a MISS: return = ``miss_return`` (default 0.0), capital
                         tied up for the whole horizon.

The blended expectancy is the simple mean across all setups. That single number —
not the eye-popping premium on the winners — is what tells you whether the
strategy pays *per dollar deployed*, because the misses are finally in the average.

Honesty knobs: ``miss_return`` and ``fail_return`` are assumptions you must own.
The default (0%) says a dead setup is bought cheap and sold flat — plausible given
the downside-protection thesis, but it is an assumption, not a measurement.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional

from .backtest import Event
from .tracking import SnapshotStore


def _norm(ticker: str) -> str:
    """Match across exchange suffixes: '5486.T' ~ '5486', 'SUNTV.NS' ~ 'SUNTV'."""
    return ticker.split(".")[0].strip().upper()


def _days_between(a: str, b: str) -> int:
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


@dataclass
class SetupOutcome:
    ticker: str
    name: str
    flagged_on: str
    status: str  # "hit" | "hit_failed" | "miss"
    realized_return: float
    event_id: Optional[str] = None
    days_to_event: Optional[int] = None


@dataclass
class ExpectancyReport:
    n_setups: int
    n_hits: int
    n_failed_hits: int
    n_misses: int
    horizon_days: int
    miss_return: float
    fail_return: float
    hit_rate: float
    mean_hit_return: Optional[float]
    blended_expectancy: float          # simple mean return per setup, over horizon
    approx_annualized: Optional[float]  # expectancy spread over the horizon
    outcomes: list[SetupOutcome]


def compute_expectancy(
    store: SnapshotStore,
    events: list[Event],
    horizon_days: int = 1095,   # ~3 years
    miss_return: float = 0.0,
    fail_return: float = 0.0,
) -> ExpectancyReport:
    # Index events by normalized ticker (keep the earliest announced per ticker).
    by_ticker: dict[str, Event] = {}
    for e in sorted(events, key=lambda x: x.announce_date):
        by_ticker.setdefault(_norm(e.ticker), e)

    outcomes: list[SetupOutcome] = []
    for ticker, (flagged_on, setup) in store.first_flagged().items():
        event = by_ticker.get(_norm(ticker))
        matched = (
            event is not None
            and event.announce_date >= flagged_on
            and _days_between(flagged_on, event.announce_date) <= horizon_days
        )
        if matched and event is not None and event.completed:
            r = event.captured_return
            outcomes.append(SetupOutcome(
                ticker, setup.name, flagged_on, "hit",
                r if r is not None else 0.0, event.event_id,
                _days_between(flagged_on, event.announce_date)))
        elif matched and event is not None:  # matched but the deal failed
            outcomes.append(SetupOutcome(
                ticker, setup.name, flagged_on, "hit_failed",
                fail_return, event.event_id,
                _days_between(flagged_on, event.announce_date)))
        else:
            outcomes.append(SetupOutcome(
                ticker, setup.name, flagged_on, "miss", miss_return))

    n = len(outcomes)
    hits = [o for o in outcomes if o.status == "hit"]
    failed_hits = [o for o in outcomes if o.status == "hit_failed"]
    misses = [o for o in outcomes if o.status == "miss"]

    returns = [o.realized_return for o in outcomes]
    blended = sum(returns) / n if n else 0.0
    mean_hit = sum(o.realized_return for o in hits) / len(hits) if hits else None
    horizon_years = horizon_days / 365.0
    approx_ann = ((1.0 + blended) ** (1.0 / horizon_years) - 1.0) if n and horizon_years > 0 else None

    return ExpectancyReport(
        n_setups=n,
        n_hits=len(hits),
        n_failed_hits=len(failed_hits),
        n_misses=len(misses),
        horizon_days=horizon_days,
        miss_return=miss_return,
        fail_return=fail_return,
        hit_rate=(len(hits) + len(failed_hits)) / n if n else 0.0,
        mean_hit_return=mean_hit,
        blended_expectancy=blended,
        approx_annualized=approx_ann,
        outcomes=outcomes,
    )


def _pct(x: Optional[float]) -> str:
    return f"{x:+.1%}" if x is not None else "n/a"


def format_report(rep: ExpectancyReport) -> str:
    L: list[str] = []
    L.append("=" * 68)
    L.append("  CourseBarvaz — blended strategy expectancy")
    L.append("=" * 68)
    L.append(f"  Setups tracked: {rep.n_setups}   horizon: {rep.horizon_days}d "
             f"(~{rep.horizon_days/365:.1f}y)")
    L.append(f"  Event hit rate: {rep.hit_rate:.0%}   "
             f"(hits {rep.n_hits}, failed-deal {rep.n_failed_hits}, misses {rep.n_misses})")
    L.append(f"  Assumptions: miss_return={_pct(rep.miss_return)}  "
             f"fail_return={_pct(rep.fail_return)}")
    L.append("")
    for o in sorted(rep.outcomes, key=lambda x: -x.realized_return):
        d = f"{o.days_to_event}d to event" if o.days_to_event is not None else "no event"
        L.append(f"    [{o.status:>10}] {_pct(o.realized_return):>8}  {o.name} ({d})")
    L.append("")
    L.append(f"  mean return on hits        : {_pct(rep.mean_hit_return)}")
    L.append(f"  >>> BLENDED expectancy     : {_pct(rep.blended_expectancy)}  "
             f"per setup over the horizon (misses included)")
    L.append(f"  approx annualized          : {_pct(rep.approx_annualized)}  "
             f"(expectancy spread over the horizon; assumes full deployment)")
    L.append("")
    L.append("  This is the number the historical backtest could not give you: it")
    L.append("  includes the dead money. It is only as real as the snapshot history")
    L.append("  behind it — collect snapshots forward, don't back-fill, to trust it.")
    L.append("=" * 68)
    return "\n".join(L)


def main(argv: list[str] | None = None) -> int:
    import argparse

    from .backtest import load_events

    p = argparse.ArgumentParser(prog="coursebarvaz-expectancy", description=__doc__)
    p.add_argument("--snapshots", default="data/snapshots", help="snapshot store directory")
    p.add_argument("--events", default="data/historical_events.csv")
    p.add_argument("--horizon-days", type=int, default=1095)
    p.add_argument("--miss-return", type=float, default=0.0)
    p.add_argument("--fail-return", type=float, default=0.0)
    args = p.parse_args(argv)

    rep = compute_expectancy(
        SnapshotStore(args.snapshots),
        load_events(args.events),
        horizon_days=args.horizon_days,
        miss_return=args.miss_return,
        fail_return=args.fail_return,
    )
    print(format_report(rep))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

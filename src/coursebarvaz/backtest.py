"""Historical event backtest — "does the method actually work?"

The scanner finds *setups*. This module scores *outcomes*: a curated set of real,
completed (and failed) control-concentration events — Japanese parent-subsidiary
buyouts and Indian promoter delistings — and computes what an early positioner
would have captured.

Two premium concepts are tracked per event because the whole thesis lives in the
gap between them:
  * ``premium_1d``    — vs the undisturbed price the day before announcement
                        (what a late buyer, reacting to the news, can still get);
  * ``premium_early`` — vs the pre-speculation price (what someone *positioned
                        early* actually captured).
The spread between the two is the strategy's edge, and it is large in the data
(e.g. Hitachi Metals: 15.1% late vs 74.5% early).

IMPORTANT — what this does and does not measure. This is a *conditional* payoff:
return **given that an event occurred**. It is selection-biased (only announced
deals are in it) and it omits the denominator that a true expectancy needs — the
setups the screener would have flagged that never triggered (dead money and
opportunity cost). Read the verdict with that caveat. It answers "how good is the
payoff, and does entering early matter?" — not "what does the blended strategy
return per dollar-year deployed?".
"""

from __future__ import annotations

import csv
import statistics
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


def _opt_f(v: str) -> Optional[float]:
    v = (v or "").strip()
    return float(v) if v else None


@dataclass
class Event:
    event_id: str
    ticker: str
    name: str
    market: str
    category: str
    counterparty: str
    announce_date: str
    resolve_date: str
    outcome: str  # "completed" | "failed"
    offer_price: Optional[float]
    premium_1d: Optional[float]
    premium_early: Optional[float]
    holding_days: Optional[float]
    notes: str = ""

    @property
    def completed(self) -> bool:
        return self.outcome.strip().lower() == "completed"

    @property
    def captured_return(self) -> Optional[float]:
        """The return an early positioner captured: prefer the early premium,
        fall back to the 1-day premium. ``None`` if no premium is recorded."""
        if not self.completed:
            return None
        return self.premium_early if self.premium_early is not None else self.premium_1d

    @property
    def annualized(self) -> Optional[float]:
        r = self.captured_return
        if r is None or not self.holding_days:
            return None
        return (1.0 + r) ** (365.0 / self.holding_days) - 1.0


def load_events(path: str | Path) -> list[Event]:
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    return [
        Event(
            event_id=r["event_id"].strip(),
            ticker=r["ticker"].strip(),
            name=r["name"].strip(),
            market=r["market"].strip(),
            category=r["category"].strip(),
            counterparty=r["counterparty"].strip(),
            announce_date=r["announce_date"].strip(),
            resolve_date=r["resolve_date"].strip(),
            outcome=r["outcome"].strip(),
            offer_price=_opt_f(r["offer_price"]),
            premium_1d=_opt_f(r["premium_1d_pct"]),
            premium_early=_opt_f(r["premium_early_pct"]),
            holding_days=_opt_f(r["holding_days"]),
            notes=r.get("notes", "").strip(),
        )
        for r in rows
    ]


@dataclass
class BacktestReport:
    n_total: int
    n_completed: int
    n_failed: int
    win_rate: float
    mean_early_premium: Optional[float]
    median_early_premium: Optional[float]
    mean_1d_premium: Optional[float]
    mean_holding_days: Optional[float]
    median_annualized: Optional[float]
    events: list[Event]

    @property
    def early_edge(self) -> Optional[float]:
        """How much more the early positioner captured vs the news-day buyer."""
        if self.mean_early_premium is None or self.mean_1d_premium is None:
            return None
        return self.mean_early_premium - self.mean_1d_premium


def _mean(xs: list[float]) -> Optional[float]:
    return statistics.fmean(xs) if xs else None


def _median(xs: list[float]) -> Optional[float]:
    return statistics.median(xs) if xs else None


def run_backtest(events: list[Event]) -> BacktestReport:
    completed = [e for e in events if e.completed]
    failed = [e for e in events if not e.completed]

    early = [e.captured_return for e in completed if e.captured_return is not None]
    ann = [e.annualized for e in completed if e.annualized is not None]
    # For the "early edge", compare only events that report BOTH premiums.
    both = [e for e in completed if e.premium_early is not None and e.premium_1d is not None]
    mean_early_on_both = _mean([e.premium_early for e in both])  # type: ignore[arg-type]
    mean_1d_on_both = _mean([e.premium_1d for e in both])        # type: ignore[arg-type]
    holds = [e.holding_days for e in completed if e.holding_days is not None]

    return BacktestReport(
        n_total=len(events),
        n_completed=len(completed),
        n_failed=len(failed),
        win_rate=len(completed) / len(events) if events else 0.0,
        mean_early_premium=mean_early_on_both,
        median_early_premium=_median(early),  # type: ignore[arg-type]
        mean_1d_premium=mean_1d_on_both,
        mean_holding_days=_mean(holds),  # type: ignore[arg-type]
        median_annualized=_median(ann),  # type: ignore[arg-type]
        events=events,
    )


def _pct(x: Optional[float]) -> str:
    return f"{x:+.1%}" if x is not None else "n/a"


def _group_line(label: str, events: list[Event]) -> str:
    """One-line summary for a subset: win rate + median captured return."""
    completed = [e for e in events if e.completed]
    wins = len(completed) / len(events) if events else 0.0
    rets = [e.captured_return for e in completed if e.captured_return is not None]
    med = _median(rets) if rets else None  # type: ignore[arg-type]
    return (f"    {label:<16} n={len(events):<3} win={wins:>3.0%}  "
            f"median premium={_pct(med)}")


def breakdown_lines(rep: BacktestReport) -> list[str]:
    by_market: dict[str, list[Event]] = {}
    by_category: dict[str, list[Event]] = {}
    for e in rep.events:
        by_market.setdefault(e.market, []).append(e)
        by_category.setdefault(e.category, []).append(e)
    lines = ["  By market:"]
    lines += [_group_line(m, evs) for m, evs in sorted(by_market.items())]
    lines.append("  By category:")
    lines += [_group_line(c, evs) for c, evs in sorted(by_category.items())]
    return lines


def format_report(rep: BacktestReport) -> str:
    lines: list[str] = []
    lines.append("=" * 68)
    lines.append("  CourseBarvaz — historical event backtest")
    lines.append("=" * 68)
    lines.append(f"  Events: {rep.n_total}   completed: {rep.n_completed}   "
                 f"failed: {rep.n_failed}   win rate: {rep.win_rate:.0%}")
    lines.append("")
    lines.append("  Per-event (early positioner's captured return):")
    for e in sorted(rep.events, key=lambda x: (x.completed, x.captured_return or -9)):
        r = e.captured_return
        ann = e.annualized
        tag = "FAILED" if not e.completed else _pct(r)
        anns = f" (~{ann:+.0%}/yr)" if ann is not None else ""
        hold = f"{int(e.holding_days)}d" if e.holding_days else "?"
        lines.append(f"    [{tag:>8}]{anns:<12} {e.name} ({e.market}, {hold})")
    lines.append("")
    lines.append("  Aggregate (completed deals with premium data):")
    lines.append(f"    median early-entry premium : {_pct(rep.median_early_premium)}")
    lines.append(f"    mean early-entry premium   : {_pct(rep.mean_early_premium)}  "
                 f"(on deals reporting both premiums)")
    lines.append(f"    mean news-day premium      : {_pct(rep.mean_1d_premium)}  "
                 f"(same deals)")
    lines.append(f"    >>> early-entry EDGE       : {_pct(rep.early_edge)}  "
                 f"(the strategy's whole point)")
    lines.append(f"    mean holding to close      : "
                 f"{rep.mean_holding_days:.0f} days" if rep.mean_holding_days else "    mean holding: n/a")
    lines.append(f"    median annualized          : {_pct(rep.median_annualized)}  "
                 f"(illustrative only — single events don't redeploy)")
    lines.append("")
    lines += breakdown_lines(rep)
    lines.append("")
    lines.append("  Structural read: Japan parent-buyouts complete at a high rate")
    lines.append("  (the parent controls the vote) at moderate premiums; Indian RBB")
    lines.append("  delistings fail often (promoter walks from a high discovered price)")
    lines.append("  but pay big when they land (SEBI 2015-18: 53% success, ~125% median).")
    lines.append("")
    lines.append("  CAVEAT: conditional on an event occurring. Selection-biased")
    lines.append("  (announced deals only) and missing the denominator of setups")
    lines.append("  that never triggered. Not a blended per-dollar-year expectancy.")
    lines.append("=" * 68)
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(prog="coursebarvaz-backtest", description=__doc__)
    parser.add_argument("--events", default="data/historical_events.csv",
                        help="CSV of historical events")
    args = parser.parse_args(argv)

    events = load_events(args.events)
    print(format_report(run_backtest(events)))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

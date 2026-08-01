"""Did the *criteria* actually catch the winners — and how long did it take?

The backtest measures what events paid. This asks the prior question: if you had
run the scanner on each company **before** its event, would your criteria have
flagged it at all? It reconstructs each event's pre-announcement fundamentals,
runs them through the exact same `ScanEngine`, and joins the verdict to the
event's outcome and time-to-event.

Two failure modes it exposes, both important:
  * a completed deal your criteria would have **missed** (too strict — you'd never
    have been in the trade), and
  * a name your criteria would have **flagged** that then took years, or failed.

This is the retrospective twin of the live snapshot→expectancy pipeline: same
question ("who meets the criteria, and what happens next"), asked backwards over
history instead of forward over time.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from .backtest import Event
from .engine import ScanEngine
from .models import Company, Market


def _f(row: dict, key: str, default: float = 0.0) -> float:
    v = (row.get(key) or "").strip()
    return float(v) if v else default


def _opt_f(row: dict, key: str) -> Optional[float]:
    v = (row.get(key) or "").strip()
    return float(v) if v else None


def _b(row: dict, key: str) -> bool:
    return str(row.get(key, "")).strip().lower() in {"1", "true", "yes", "y"}


@dataclass
class PreEventFundamentals:
    event_id: str
    company: Company
    asof: str
    confidence: str
    note: str


def load_preevent(path: str | Path) -> dict[str, PreEventFundamentals]:
    """Load pre-announcement fundamentals keyed by event_id."""
    out: dict[str, PreEventFundamentals] = {}
    with open(path, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            eid = row["event_id"].strip()
            company = Company(
                ticker=eid, name=row.get("name", eid).strip() or eid,
                market=Market(row["market"].strip()),
                market_cap=_f(row, "market_cap"),
                book_value=_f(row, "book_value"),
                cash_and_equivalents=_f(row, "cash_and_equivalents"),
                total_debt=_f(row, "total_debt"),
                net_income=_f(row, "net_income"),
                operating_income=_f(row, "operating_income"),
                has_listed_parent=_b(row, "has_listed_parent"),
                parent_ticker=(row.get("parent_ticker") or "").strip() or None,
                parent_ownership_pct=_opt_f(row, "parent_ownership_pct"),
                promoter_holding_pct=_opt_f(row, "promoter_holding_pct"),
                pledged_shares_pct=_f(row, "pledged_shares_pct"),
                source="preevent",
            )
            out[eid] = PreEventFundamentals(
                eid, company, row.get("asof", "").strip(),
                row.get("confidence", "").strip(), row.get("note", "").strip())
    return out


@dataclass
class CriteriaOutcome:
    event_id: str
    name: str
    market: str
    met_criteria: bool
    event_completed: bool
    holding_days: Optional[float]
    captured_return: Optional[float]
    failed_gates: list[str]


def check(events: list[Event], preevent: dict[str, PreEventFundamentals]) -> list[CriteriaOutcome]:
    engine = ScanEngine()
    by_id = {e.event_id: e for e in events}
    outcomes: list[CriteriaOutcome] = []
    for eid, pe in preevent.items():
        event = by_id.get(eid)
        if event is None:
            continue
        result = engine.evaluate(pe.company)
        met = bool(result and result.qualified)
        failed = [s.label for s in result.failed_signals] if result else ["no scanner for market"]
        outcomes.append(CriteriaOutcome(
            event_id=eid,
            name=event.name,
            market=event.market,
            met_criteria=met,
            event_completed=event.completed,
            holding_days=event.holding_days,
            captured_return=event.captured_return,
            failed_gates=failed,
        ))
    return outcomes


def _pct(x: Optional[float]) -> str:
    return f"{x:+.0%}" if x is not None else "n/a"


def format_report(outcomes: list[CriteriaOutcome]) -> str:
    L: list[str] = []
    L.append("=" * 70)
    L.append("  CourseBarvaz — did the criteria catch the winners?")
    L.append("=" * 70)
    n = len(outcomes)
    met = [o for o in outcomes if o.met_criteria]
    completed = [o for o in outcomes if o.event_completed]
    met_and_won = [o for o in met if o.event_completed]
    L.append(f"  Events with reconstructed pre-event fundamentals: {n}")
    L.append(f"  Met the criteria (would have been flagged): {len(met)}/{n}")
    if completed:
        L.append(f"  Criteria CAPTURE RATE of completed deals: "
                 f"{len(met_and_won)}/{len(completed)} = {len(met_and_won)/len(completed):.0%}")
    met_hold = [o.holding_days for o in met_and_won if o.holding_days is not None]
    if met_hold:
        med = sorted(met_hold)[len(met_hold) // 2]
        L.append(f"  Time to work (flagged winners): median {med:.0f}d "
                 f"(range {min(met_hold):.0f}-{max(met_hold):.0f}d)")
    L.append("")
    L.append("  Per event:")
    for o in sorted(outcomes, key=lambda x: (not x.met_criteria, x.market)):
        verdict = "MET " if o.met_criteria else "MISS"
        outcome = "won" if o.event_completed else "FAILED"
        hold = f"{int(o.holding_days)}d" if o.holding_days else "?"
        ret = _pct(o.captured_return)
        line = f"    [{verdict}] {o.name} ({o.market}, event {outcome}, {hold}, {ret})"
        L.append(line)
        if not o.met_criteria:
            L.append(f"           excluded by: {', '.join(o.failed_gates)}")
    L.append("")
    L.append("  Read: a low capture rate means the criteria are too strict — the")
    L.append("  deep-value + big-net-cash gate is rare, so it misses most real")
    L.append("  events. That is the safety/breadth trade-off, made measurable.")
    L.append("=" * 70)
    return "\n".join(L)


def main(argv: list[str] | None = None) -> int:
    import argparse

    from .backtest import load_events

    p = argparse.ArgumentParser(prog="coursebarvaz-criteria", description=__doc__)
    p.add_argument("--events", default="data/historical_events.csv")
    p.add_argument("--preevent", default="data/preevent_fundamentals.csv")
    args = p.parse_args(argv)

    outcomes = check(load_events(args.events), load_preevent(args.preevent))
    print(format_report(outcomes))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

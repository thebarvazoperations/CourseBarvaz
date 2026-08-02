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


def check(events: list[Event], preevent: dict[str, PreEventFundamentals],
          config=None) -> list[CriteriaOutcome]:
    from .config import DEFAULT

    engine = ScanEngine(config or DEFAULT)
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


def sweep_report(events: list[Event], preevent: dict[str, PreEventFundamentals]) -> str:
    """Grid-sweep the Japan gate (max P/B x min net-cash) and show capture rate.

    The safety gate (net-cash-positive, operating profit, no pledge) stays ON
    throughout, so loosening P/B / net-cash never lets a broken balance sheet
    through — you can read the knee where breadth rises without buying junk.
    """
    from dataclasses import replace

    from .config import DEFAULT

    pbs = [0.8, 1.0, 1.5, 2.0, 2.5, 3.0]
    ncs = [0.50, 0.25, 0.10, 0.0]
    jp_completed = [e for e in events
                    if e.market == "JP" and e.completed and e.event_id in preevent]

    L: list[str] = []
    L.append("  Japan capture-rate sweep (rows = min net-cash/mcap, cols = max P/B)")
    L.append(f"  Denominator = {len(jp_completed)} completed JP deals with pre-event data")
    L.append("           " + "".join(f"P/B<={p:<6}" for p in pbs))
    for nc in ncs:
        cells = []
        for pb in pbs:
            cfg = replace(DEFAULT, japan=replace(DEFAULT.japan, max_pb=pb, min_net_cash_to_mcap=nc))
            outs = [o for o in check(events, preevent, cfg)
                    if o.market == "JP" and o.event_completed]
            got = sum(o.met_criteria for o in outs)
            cells.append(f"{got}/{len(outs):<7}")
        L.append(f"  nc>={nc:<4} " + "".join(cells))
    L.append("")
    L.append("  Safety gate stays ON, so net-debt names (Toyota Industries, NTT")
    L.append("  Data) never qualify no matter how far P/B is loosened. The knee is")
    L.append("  around P/B<=2.0, net-cash>=0: it catches the profitable, cash-")
    L.append("  positive subs (Docomo, Sony, Hitachi Transport) and stops there.")
    return "\n".join(L)


def main(argv: list[str] | None = None) -> int:
    import argparse

    from .backtest import load_events

    p = argparse.ArgumentParser(prog="coursebarvaz-criteria", description=__doc__)
    p.add_argument("--events", default="data/historical_events.csv")
    p.add_argument("--preevent", default="data/preevent_fundamentals.csv")
    # Calibration knobs — override the gate thresholds to see capture rate move.
    p.add_argument("--jp-max-pb", type=float)
    p.add_argument("--jp-min-netcash", type=float)
    p.add_argument("--in-max-pb", type=float)
    p.add_argument("--in-min-promoter", type=float)
    p.add_argument("--in-max-promoter", type=float)
    p.add_argument("--sweep", action="store_true",
                   help="grid-sweep Japan thresholds and print capture rate for each")
    args = p.parse_args(argv)

    events = load_events(args.events)
    preevent = load_preevent(args.preevent)

    if args.sweep:
        print(sweep_report(events, preevent))
        return 0

    outcomes = check(events, preevent, _build_config(args))
    print(format_report(outcomes))
    return 0


def _build_config(args):
    """Build a Config from CLI overrides, falling back to the defaults."""
    from dataclasses import replace

    from .config import DEFAULT

    japan = DEFAULT.japan
    if args.jp_max_pb is not None:
        japan = replace(japan, max_pb=args.jp_max_pb)
    if args.jp_min_netcash is not None:
        japan = replace(japan, min_net_cash_to_mcap=args.jp_min_netcash)
    india = DEFAULT.india
    if args.in_max_pb is not None:
        india = replace(india, max_pb=args.in_max_pb)
    if args.in_min_promoter is not None:
        india = replace(india, min_promoter_holding=args.in_min_promoter)
    if args.in_max_promoter is not None:
        india = replace(india, max_promoter_holding=args.in_max_promoter)
    return replace(DEFAULT, japan=japan, india=india)


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

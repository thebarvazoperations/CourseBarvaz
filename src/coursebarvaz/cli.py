"""Command-line entry point.

Examples
--------
Scan the bundled sample data::

    python -m coursebarvaz --data data/japan_sample.csv data/india_sample.csv

Only Japan, and show why rejected names failed::

    python -m coursebarvaz --data data/japan_sample.csv --market JP --show-rejected

Emit JSON for downstream tooling::

    python -m coursebarvaz --data data/*.csv --json
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Sequence

from .engine import ScanEngine
from .models import Market, ScanResult
from .providers.csv_provider import CsvProvider


def _result_to_dict(r: ScanResult) -> dict:
    return {
        "ticker": r.company.ticker,
        "name": r.company.name,
        "market": r.company.market.value,
        "scanner": r.scanner,
        "qualified": r.qualified,
        "score": r.score,
        "pb_ratio": r.metrics.pb_ratio,
        "net_cash_to_mcap": r.metrics.net_cash_to_mcap,
        "signals": [
            {"label": s.label, "passed": s.passed, "detail": s.detail}
            for s in r.signals
        ],
    }


def _print_human(results: list[ScanResult], show_rejected: bool) -> None:
    qualified = [r for r in results if r.qualified]
    print(f"\n{'='*64}\n  CourseBarvaz — early-positioning scan\n{'='*64}")
    print(f"  Qualified candidates: {len(qualified)} / {len(results)} evaluated\n")

    for r in results:
        if not r.qualified and not show_rejected:
            continue
        tag = f"score {r.score:>5.1f}" if r.qualified else "REJECTED".rjust(9)
        pb = f"{r.metrics.pb_ratio:.2f}" if r.metrics.pb_ratio is not None else "n/a"
        print(f"[{tag}] {r.company.ticker:<12} {r.company.name}")
        print(f"           market={r.company.market.value} scanner={r.scanner} P/B={pb}")
        for s in r.signals:
            if not s.passed or r.qualified:
                print(f"           {s}")
        print()


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="coursebarvaz", description=__doc__)
    parser.add_argument("--data", nargs="+", required=True, help="CSV file(s) of fundamentals")
    parser.add_argument("--market", choices=[m.value for m in Market], help="restrict to one market")
    parser.add_argument("--show-rejected", action="store_true", help="also list filtered-out names")
    parser.add_argument("--json", action="store_true", help="emit JSON instead of a table")
    args = parser.parse_args(argv)

    provider = CsvProvider(*args.data)
    market = Market(args.market) if args.market else None
    engine = ScanEngine()

    results = engine.scan(provider, market=market, include_rejected=args.show_rejected)

    if args.json:
        json.dump([_result_to_dict(r) for r in results], sys.stdout, indent=2, ensure_ascii=False)
        sys.stdout.write("\n")
    else:
        _print_human(results, show_rejected=args.show_rejected)

    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

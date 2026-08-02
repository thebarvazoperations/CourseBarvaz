#!/usr/bin/env python3
"""Build a real, hundreds-strong candidate CSV from a ticker list — run locally.

Why this is a script you run, not something the scanner does live: financial data
feeds (Yahoo/yfinance, screener.in, stockanalysis) are blocked from the hosted
sandbox this repo was built in. On your own machine they work fine. This script
pulls the *market-derived* fields via yfinance for every ticker you give it and
writes a scanner-ready CSV.

The *event* fields yfinance cannot provide — promoter holding %, pledged shares,
and whether a listed parent exists — are the differentiating inputs. Supply them
via an overrides CSV (from screener.in / BSE-NSE / EDINET / TSE disclosures) and
they are merged in. Rows keep whatever you provide and leave the rest blank.

Usage
-----
    # 1) put your candidate tickers (yfinance symbols) in tickers.txt, one per line:
    #    7282.T  JP  Toyoda Gosei
    #    SUNTV.NS  IN  Sun TV Network
    #    ...  (hundreds of them)
    #
    # 2) optionally an overrides.csv with the event fields:
    #    ticker,has_listed_parent,parent_ticker,parent_ownership_pct,promoter_holding_pct,pledged_shares_pct
    #
    pip install yfinance
    python scripts/build_universe.py --tickers tickers.txt \
        --overrides overrides.csv --out data/universe.csv

    # 3) scan it:
    python -m coursebarvaz --data data/universe.csv --show-rejected
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path

FIELDNAMES = [
    "ticker", "name", "market", "market_cap", "book_value",
    "cash_and_equivalents", "total_debt", "net_income", "operating_income",
    "has_listed_parent", "parent_ticker", "parent_ownership_pct",
    "promoter_holding_pct", "pledged_shares_pct",
]


def read_tickers(path: Path) -> list[tuple[str, str, str]]:
    """Each line: '<ticker> <market> <name...>' (market = JP or IN)."""
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(None, 2)
        ticker = parts[0]
        market = parts[1] if len(parts) > 1 else ""
        name = parts[2] if len(parts) > 2 else ticker
        out.append((ticker, market, name))
    return out


def read_overrides(path: Path | None) -> dict[str, dict]:
    if not path:
        return {}
    with open(path, newline="", encoding="utf-8") as fh:
        return {r["ticker"].strip(): r for r in csv.DictReader(fh)}


def fetch_market_fields(ticker: str) -> dict | None:
    import yfinance as yf

    info = yf.Ticker(ticker).info or {}
    mcap = info.get("marketCap")
    bvps = info.get("bookValue")
    shares = info.get("sharesOutstanding")
    if not mcap or not bvps or not shares:
        return None
    return {
        "name": info.get("shortName") or "",
        "market_cap": float(mcap),
        "book_value": float(bvps) * float(shares),
        "cash_and_equivalents": float(info.get("totalCash") or 0.0),
        "total_debt": float(info.get("totalDebt") or 0.0),
        "net_income": float(info.get("netIncomeToCommon") or 0.0),
        "operating_income": float(info.get("operatingMargins") or 0.0)
        * float(info.get("totalRevenue") or 0.0),
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--tickers", required=True, type=Path)
    p.add_argument("--overrides", type=Path, default=None)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument("--sleep", type=float, default=0.5, help="seconds between fetches")
    args = p.parse_args(argv)

    try:
        import yfinance  # noqa: F401
    except ImportError:
        print("yfinance not installed. Run: pip install yfinance", file=sys.stderr)
        return 2

    tickers = read_tickers(args.tickers)
    overrides = read_overrides(args.overrides)

    written, skipped = 0, 0
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDNAMES)
        w.writeheader()
        for ticker, market, name in tickers:
            try:
                fields = fetch_market_fields(ticker)
            except Exception as exc:  # network / parse issues shouldn't kill the run
                print(f"  ! {ticker}: {exc}", file=sys.stderr)
                fields = None
            if fields is None:
                skipped += 1
                print(f"  - skipped {ticker} (missing market data)", file=sys.stderr)
                continue

            row = {k: "" for k in FIELDNAMES}
            row.update({"ticker": ticker, "market": market,
                        "name": name or fields["name"]})
            row.update({k: fields[k] for k in (
                "market_cap", "book_value", "cash_and_equivalents",
                "total_debt", "net_income", "operating_income")})
            for k, v in overrides.get(ticker, {}).items():
                if k in FIELDNAMES and str(v).strip():
                    row[k] = v
            w.writerow(row)
            written += 1
            print(f"  + {ticker} {name}", file=sys.stderr)
            time.sleep(args.sleep)

    print(f"\nWrote {written} rows ({skipped} skipped) -> {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

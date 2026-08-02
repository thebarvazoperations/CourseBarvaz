#!/usr/bin/env python3
"""Replace reported premiums with returns computed from REAL prices — run locally.

Every analysis tool in this repo has, until now, used each event's reported
*premium* as a proxy for the entry->exit return. This script closes that gap: for
each historical event it pulls the actual daily price series via yfinance and
computes the real return an early positioner (and a news-day buyer) would have
realized, from real closes.

Why it's a script, not part of the package: the build sandbox blocks every price
feed (Yahoo included). On your own machine yfinance works, so you run this to
materialize real returns and feed them back in.

Two entry points per event mirror the whole analysis:
  * EARLY  — close ~N days before the announcement (default 90) — pre-speculation
             positioning, the strategy's actual claim; and
  * NEWS   — close 1 trading day before the announcement — reacting to the news.
Exit is the close nearest the event's resolve date.

Coverage caveat, stated plainly: many event tickers are **already delisted**
(NTT Docomo, Hitachi Metals, Taisho, Toyota Industries...). yfinance usually has
no history for a delisted symbol, so those rows will be reported as MISSING, not
guessed. Expect partial coverage; fill the gaps from a data source that retains
delisted history (or keep the reported premium for those).

Usage
-----
    pip install yfinance
    # 1) compute real returns into a report:
    python scripts/compute_real_returns.py --events data/historical_events.csv \
        --out data/historical_returns.csv
    # 2) also emit a patched events file (real returns overwrite the premiums):
    python scripts/compute_real_returns.py --events data/historical_events.csv \
        --out data/historical_returns.csv \
        --patch-out data/historical_events_realprices.csv
    # 3) run the existing tools on REAL prices — no code changes needed:
    python -m coursebarvaz.backtest  --events data/historical_events_realprices.csv
    python -m coursebarvaz.portfolio --events data/historical_events_realprices.csv
"""

from __future__ import annotations

import argparse
import csv
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional


def _d(s: str) -> Optional[date]:
    s = (s or "").strip()
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


def _price_near(hist, target: date, window: int = 10) -> Optional[tuple[str, float]]:
    """Nearest available close to ``target`` within +/- ``window`` days.

    ``hist`` is a yfinance history DataFrame indexed by date. Returns
    (iso_date, price) or None if nothing is in range.
    """
    if hist is None or len(hist) == 0:
        return None
    col = "Close"
    best = None
    for ts, row in hist.iterrows():
        d = ts.date() if hasattr(ts, "date") else ts
        delta = abs((d - target).days)
        if delta <= window and (best is None or delta < best[0]):
            price = float(row[col])
            best = (delta, d.isoformat(), price)
    return (best[1], best[2]) if best else None


def _fetch_history(ticker: str, start: date, end: date):
    import yfinance as yf

    # auto_adjust=True folds dividends/splits into Close (total-return proxy).
    hist = yf.Ticker(ticker).history(
        start=start.isoformat(), end=end.isoformat(), auto_adjust=True)
    return hist if hist is not None and len(hist) else None


def compute(events_path: Path, entry_offset_days: int) -> list[dict]:
    rows = []
    with open(events_path, newline="", encoding="utf-8") as fh:
        events = list(csv.DictReader(fh))

    for e in events:
        eid = e["event_id"].strip()
        ticker = e["ticker"].strip()
        announce = _d(e["announce_date"])
        resolve = _d(e["resolve_date"])
        rec = {"event_id": eid, "ticker": ticker, "status": "", "note": "",
               "entry_early_date": "", "entry_early_price": "",
               "entry_news_date": "", "entry_news_price": "",
               "exit_date": "", "exit_price": "",
               "return_early": "", "return_news": ""}

        if announce is None or resolve is None:
            rec["status"] = "skipped"
            rec["note"] = "missing announce/resolve date (e.g. a failed deal)"
            rows.append(rec)
            continue

        early_target = announce - timedelta(days=entry_offset_days)
        news_target = announce - timedelta(days=1)
        try:
            hist = _fetch_history(ticker, early_target - timedelta(days=15),
                                  resolve + timedelta(days=15))
        except Exception as exc:  # network/parse issues shouldn't abort the run
            rec["status"] = "error"
            rec["note"] = str(exc)[:120]
            rows.append(rec)
            continue

        if hist is None:
            rec["status"] = "missing"
            rec["note"] = "no price history (likely delisted)"
            rows.append(rec)
            continue

        early = _price_near(hist, early_target)
        news = _price_near(hist, news_target)
        exit_ = _price_near(hist, resolve)
        if exit_ is None or (early is None and news is None):
            rec["status"] = "partial"
            rec["note"] = "could not locate entry and/or exit close in window"
            rows.append(rec)
            continue

        rec["exit_date"], exit_price = exit_
        rec["exit_price"] = round(exit_price, 4)
        if early:
            rec["entry_early_date"], p = early
            rec["entry_early_price"] = round(p, 4)
            rec["return_early"] = round(exit_price / p - 1.0, 4)
        if news:
            rec["entry_news_date"], p = news
            rec["entry_news_price"] = round(p, 4)
            rec["return_news"] = round(exit_price / p - 1.0, 4)
        rec["status"] = "ok"
        rows.append(rec)
    return rows


def write_report(rows: list[dict], out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    fields = ["event_id", "ticker", "status", "entry_early_date", "entry_early_price",
              "entry_news_date", "entry_news_price", "exit_date", "exit_price",
              "return_early", "return_news", "note"]
    with open(out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def patch_events(events_path: Path, rows: list[dict], patch_out: Path) -> int:
    """Write a copy of the events file with premium_* replaced by real returns.

    Only rows we computed (status ok) are overwritten; everything else is passed
    through unchanged, so the patched file stays a drop-in for the existing tools.
    """
    real = {r["event_id"]: r for r in rows if r["status"] == "ok"}
    with open(events_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        fields = reader.fieldnames or []
        events = list(reader)
    patched = 0
    for e in events:
        r = real.get(e["event_id"].strip())
        if not r:
            continue
        if r["return_early"] != "":
            e["premium_early_pct"] = r["return_early"]
        if r["return_news"] != "":
            e["premium_1d_pct"] = r["return_news"]
        note = (e.get("notes") or "").strip()
        e["notes"] = (note + " | REAL-PRICE return").strip(" |")
        patched += 1
    patch_out.parent.mkdir(parents=True, exist_ok=True)
    with open(patch_out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(events)
    return patched


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--events", type=Path, default=Path("data/historical_events.csv"))
    p.add_argument("--out", type=Path, default=Path("data/historical_returns.csv"))
    p.add_argument("--patch-out", type=Path, default=None,
                   help="also write an events file with premiums replaced by real returns")
    p.add_argument("--entry-offset-days", type=int, default=90,
                   help="how many days before the announcement the EARLY entry sits")
    args = p.parse_args(argv)

    try:
        import yfinance  # noqa: F401
    except ImportError:
        print("yfinance not installed. Run: pip install yfinance", file=sys.stderr)
        return 2

    rows = compute(args.events, args.entry_offset_days)
    write_report(rows, args.out)

    by_status: dict[str, int] = {}
    for r in rows:
        by_status[r["status"]] = by_status.get(r["status"], 0) + 1
    ok = [r for r in rows if r["status"] == "ok"]

    print(f"Wrote {len(rows)} rows -> {args.out}")
    print("Coverage: " + ", ".join(f"{k}={v}" for k, v in sorted(by_status.items())))
    for r in ok:
        print(f"  {r['event_id']:<20} early {r['return_early'] or 'n/a':>8}  "
              f"news {r['return_news'] or 'n/a':>8}  (exit {r['exit_date']})")
    if by_status.get("missing"):
        print(f"\n{by_status['missing']} events had no price history (likely delisted) — "
              "keep their reported premiums or source delisted history separately.")

    if args.patch_out:
        n = patch_events(args.events, rows, args.patch_out)
        print(f"\nPatched {n} events with real-price returns -> {args.patch_out}")
        print("Now run:  python -m coursebarvaz.backtest  --events "
              f"{args.patch_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

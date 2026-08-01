#!/usr/bin/env python3
"""Deep-value / high-ownership stock scanner.

Two INDEPENDENT screening tracks, combined with a top-level OR, plus a shared
liquidity gate. This design exists because the two theses do not overlap:

  Track A - Ownership / free-float pressure
      High controlling-shareholder (promoter/insider) ownership on a SMALL cap.
      Natural candidates for buybacks, delisting, tender offers, or a squeeze-out.
      -> Does NOT require the stock to be statistically cheap.

  Track B - Deep value
      Low price-to-book OR a large net-cash cushion relative to market cap.
      -> Does NOT require concentrated ownership. Most Japanese net-nets have
         dispersed / cross-held ownership and would be wrongly excluded by an
         insider-ownership filter.

  Track C - Structural discount
      A dual-class / savings / preferred line trading below the ordinary share,
      or a holding company trading below NAV. Keyed off `discount_pct`.
      -> Does NOT require a small cap: these situations (Swire B, Exor, HAL,
         Korean prefs, Italian savings shares) are usually LARGE caps, so the
         value-track market-cap ceiling would wrongly delete them.

A single `insider >= 70% AND P/B <= 0.7 AND ...` AND-chain collapses to almost
nothing because it demands every thesis at once. Keeping the tracks separate is
the whole point.

Usage:
    python scanner.py                         # scan data/tickers.csv
    python scanner.py -i universe.csv         # custom input
    python scanner.py -o shortlist.csv        # write shortlist
    python scanner.py -v                      # also print why names were rejected

Nothing here is investment advice. Seed financials are approximate.
"""

from __future__ import annotations

import argparse
import csv
import sys
from dataclasses import dataclass, field
from pathlib import Path

# --------------------------------------------------------------------------- #
# Thresholds - tune these in one place.
# --------------------------------------------------------------------------- #

# Track A: ownership / free-float pressure
INSIDER_MIN_PCT = 70.0            # controlling-shareholder ownership floor
MCAP_MAX_OWNERSHIP_USD_M = 300.0  # small-cap ceiling for the ownership thesis

# Track B: deep value
PB_MAX = 0.70                     # price-to-book ceiling
NETCASH_RATIO_MIN = 0.50          # (net cash / market cap) floor
MCAP_MAX_VALUE_USD_M = 2000.0     # value names can be larger than micro-caps

# Track C: structural discount (dual-class / holdco-NAV / savings-preferred)
DISCOUNT_MIN_PCT = 25.0          # min discount to ordinary / to NAV; no mcap cap

# Shared liquidity gate (applied to ALL tracks)
ADV_MIN_USD = 5000.0             # min ~90d average daily traded value


# --------------------------------------------------------------------------- #
# Data model
# --------------------------------------------------------------------------- #

@dataclass
class Stock:
    ticker: str
    name: str
    country: str
    exchange: str
    insider_pct: float
    market_cap_usd_m: float
    price_to_book: float          # <= 0 means unknown
    net_cash_usd_m: float
    adv_usd: float
    discount_pct: float = 0.0     # structural discount to ordinary / to NAV
    thesis: str = ""

    @property
    def net_cash_ratio(self) -> float:
        if self.market_cap_usd_m <= 0:
            return 0.0
        return self.net_cash_usd_m / self.market_cap_usd_m

    @property
    def has_pb(self) -> bool:
        return self.price_to_book is not None and self.price_to_book > 0


@dataclass
class Verdict:
    stock: Stock
    tracks: list[str] = field(default_factory=list)   # which tracks passed
    reasons: list[str] = field(default_factory=list)  # why it failed (if it did)

    @property
    def passed(self) -> bool:
        return bool(self.tracks)


# --------------------------------------------------------------------------- #
# Loading
# --------------------------------------------------------------------------- #

def _to_float(value: str, default: float = 0.0) -> float:
    value = (value or "").strip()
    if value == "":
        return default
    try:
        return float(value)
    except ValueError:
        return default


def load_universe(path: Path) -> list[Stock]:
    """Read the CSV, skipping blank lines and '#' comment lines."""
    stocks: list[Stock] = []
    with path.open(newline="", encoding="utf-8") as fh:
        rows = (line for line in fh if line.strip() and not line.lstrip().startswith("#"))
        reader = csv.DictReader(rows)
        for row in reader:
            stocks.append(
                Stock(
                    ticker=row["ticker"].strip(),
                    name=row["name"].strip(),
                    country=row["country"].strip(),
                    exchange=row["exchange"].strip(),
                    insider_pct=_to_float(row["insider_pct"]),
                    market_cap_usd_m=_to_float(row["market_cap_usd_m"]),
                    price_to_book=_to_float(row["price_to_book"], default=-1.0),
                    net_cash_usd_m=_to_float(row["net_cash_usd_m"]),
                    adv_usd=_to_float(row["adv_usd"]),
                    discount_pct=_to_float(row.get("discount_pct", "")),
                    thesis=(row.get("thesis") or "").strip(),
                )
            )
    return stocks


# --------------------------------------------------------------------------- #
# Screening
# --------------------------------------------------------------------------- #

def screen(stock: Stock) -> Verdict:
    verdict = Verdict(stock=stock)

    # Shared liquidity gate first - illiquid names are untradeable regardless of thesis.
    if stock.adv_usd < ADV_MIN_USD:
        verdict.reasons.append(
            f"illiquid: ADV ${stock.adv_usd:,.0f} < ${ADV_MIN_USD:,.0f}"
        )
        return verdict

    # --- Track A: ownership / free-float pressure ---
    a_ok = True
    if stock.insider_pct < INSIDER_MIN_PCT:
        a_ok = False
        verdict.reasons.append(
            f"[A] insider {stock.insider_pct:.1f}% < {INSIDER_MIN_PCT:.0f}%"
        )
    if stock.market_cap_usd_m > MCAP_MAX_OWNERSHIP_USD_M:
        a_ok = False
        verdict.reasons.append(
            f"[A] mcap ${stock.market_cap_usd_m:,.0f}M > ${MCAP_MAX_OWNERSHIP_USD_M:,.0f}M"
        )
    if a_ok:
        verdict.tracks.append("A:ownership")

    # --- Track B: deep value ---
    b_ok = True
    cheap_pb = stock.has_pb and stock.price_to_book <= PB_MAX
    cash_rich = stock.net_cash_ratio >= NETCASH_RATIO_MIN
    if not (cheap_pb or cash_rich):
        b_ok = False
        pb_txt = f"{stock.price_to_book:.2f}" if stock.has_pb else "n/a"
        verdict.reasons.append(
            f"[B] not cheap: P/B {pb_txt} > {PB_MAX} and "
            f"net-cash/mcap {stock.net_cash_ratio:.2f} < {NETCASH_RATIO_MIN}"
        )
    if stock.market_cap_usd_m > MCAP_MAX_VALUE_USD_M:
        b_ok = False
        verdict.reasons.append(
            f"[B] mcap ${stock.market_cap_usd_m:,.0f}M > ${MCAP_MAX_VALUE_USD_M:,.0f}M"
        )
    if b_ok:
        verdict.tracks.append("B:value")

    # --- Track C: structural discount (no market-cap ceiling) ---
    if stock.discount_pct >= DISCOUNT_MIN_PCT:
        verdict.tracks.append("C:discount")
    else:
        verdict.reasons.append(
            f"[C] discount {stock.discount_pct:.0f}% < {DISCOUNT_MIN_PCT:.0f}%"
        )

    return verdict


def scan(stocks: list[Stock]) -> list[Verdict]:
    return [screen(s) for s in stocks]


# --------------------------------------------------------------------------- #
# Reporting
# --------------------------------------------------------------------------- #

def print_report(verdicts: list[Verdict], verbose: bool) -> None:
    passed = [v for v in verdicts if v.passed]
    failed = [v for v in verdicts if not v.passed]

    print(f"\nUniverse: {len(verdicts)} names\n")

    print("=" * 78)
    print(f"SHORTLIST ({len(passed)})")
    print("=" * 78)
    if passed:
        header = (f"{'Ticker':<12}{'Name':<26}{'Cty':<4}{'Ins%':>6}"
                  f"{'Mcap$M':>9}{'P/B':>6}{'Disc%':>7}  Tracks")
        print(header)
        print("-" * 90)
        for v in sorted(passed, key=lambda x: (-len(x.tracks), x.stock.ticker)):
            s = v.stock
            pb = f"{s.price_to_book:.2f}" if s.has_pb else "n/a"
            disc = f"{s.discount_pct:.0f}" if s.discount_pct else "-"
            print(
                f"{s.ticker:<12}{s.name[:25]:<26}{s.country:<4}"
                f"{s.insider_pct:>6.1f}{s.market_cap_usd_m:>9,.0f}{pb:>6}{disc:>7}  "
                + ", ".join(v.tracks)
            )
    else:
        print("(empty)")

    if verbose:
        print("\n" + "=" * 78)
        print(f"REJECTED ({len(failed)})")
        print("=" * 78)
        for v in sorted(failed, key=lambda x: x.stock.ticker):
            print(f"{v.stock.ticker:<12} {v.stock.name}")
            for reason in v.reasons:
                print(f"    - {reason}")
    print()


def write_shortlist(verdicts: list[Verdict], path: Path) -> None:
    passed = [v for v in verdicts if v.passed]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(
            ["ticker", "name", "country", "exchange", "insider_pct",
             "market_cap_usd_m", "price_to_book", "net_cash_ratio",
             "adv_usd", "discount_pct", "tracks", "thesis"]
        )
        for v in passed:
            s = v.stock
            writer.writerow(
                [s.ticker, s.name, s.country, s.exchange, s.insider_pct,
                 s.market_cap_usd_m,
                 s.price_to_book if s.has_pb else "",
                 round(s.net_cash_ratio, 3), s.adv_usd, s.discount_pct,
                 "|".join(v.tracks), s.thesis]
            )
    print(f"Shortlist written to {path} ({len(passed)} names)")


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "-i", "--input", type=Path, default=Path("data/tickers.csv"),
        help="input universe CSV (default: data/tickers.csv)",
    )
    parser.add_argument(
        "-o", "--output", type=Path, default=None,
        help="optional path to write the shortlist CSV",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true",
        help="print rejection reasons for every excluded name",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if not args.input.exists():
        print(f"error: input file not found: {args.input}", file=sys.stderr)
        return 1

    stocks = load_universe(args.input)
    verdicts = scan(stocks)
    print_report(verdicts, verbose=args.verbose)
    if args.output:
        write_shortlist(verdicts, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

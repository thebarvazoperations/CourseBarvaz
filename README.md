# CourseBarvaz — Deep-Value / High-Ownership Scanner

A small, dependency-free stock screener for surfacing three kinds of situations:

- **Ownership / free-float pressure** — high controlling-shareholder ownership on
  a small cap (buyback / delisting / tender-offer / squeeze-out candidates).
- **Deep value** — low price-to-book or a large net-cash cushion, regardless of
  who owns the shares.
- **Structural discount** — a dual-class / savings / preferred line below the
  ordinary share, or a holding company below NAV.

## Why three tracks (not one AND-chain)

A naive single filter —

```
insider >= 70%  AND  mcap <= $300M  AND  (P/B <= 0.7 OR net_cash/mcap >= 0.5)  AND  ADV >= $5k
```

— collapses to almost nothing, because it demands **every** thesis at once. Most
Japanese net-nets are cheap but have *dispersed* ownership, so the `insider >= 70%`
leg deletes the entire value basket. The high-ownership Indian subsidiaries trade
at *premium* P/B (quality/dividend), so they fail the value leg. And the global
dual-class / holdco discounts are almost all *large* caps, so the market-cap
ceiling deletes them.

So the scanner runs **three independent tracks** combined with a top-level OR,
plus a shared liquidity gate:

| Track | Requires | Ignores |
|-------|----------|---------|
| **A — Ownership** | `insider >= 70%` **and** `mcap <= $300M` | valuation, discount |
| **B — Value** | `P/B <= 0.7` **or** `net_cash/mcap >= 0.5`, **and** `mcap <= $2B` | ownership, discount |
| **C — Discount** | `discount_pct >= 25%` (to ordinary or to NAV) | ownership, valuation, **market cap** |
| **gate (all)** | `ADV >= $5k/day` | — |

These map to the three original research buckets: A = India subsidiaries,
B = Japan net-nets, C = global dual-class / holdco / savings-preferred.
All thresholds live at the top of `scanner.py`.

## Usage

```bash
python3 scanner.py                 # scan data/tickers.csv, print the shortlist
python3 scanner.py -v              # also print why each name was rejected
python3 scanner.py -o shortlist.csv  # write the shortlist to CSV
python3 scanner.py -i universe.csv   # scan a different universe
```

No third-party packages — standard library only.

## Input format

`data/tickers.csv`. Lines starting with `#` and blank lines are ignored.

| column | meaning |
|--------|---------|
| `ticker`, `name`, `country`, `exchange` | identity |
| `insider_pct` | promoter / insider / controlling-family ownership, % |
| `market_cap_usd_m` | market cap, USD millions |
| `price_to_book` | P/B (blank / `<=0` = unknown) |
| `net_cash_usd_m` | cash + equivalents − total debt, USD millions (negative = net debt) |
| `adv_usd` | ~90-day average daily traded value, USD |
| `discount_pct` | structural discount to ordinary / to NAV, % (0 = n/a) |
| `thesis` | free-text tag |

## Precedents

`data/past_cases.md` is a catalogue of **past cases** where these setups actually
resolved — Indian MNC delistings, Japanese parent-subsidiary take-privates and
MBOs, Italian savings-share conversions, global holdco/NAV and dual-class events,
and Hong Kong scheme-of-arrangement privatizations (including failures). Use the
historical premiums/ratios as base rates for each track.

## Seed universe

The shipped `data/tickers.csv` holds ~50 example names (India / Japan / global)
with **approximate** 2025-2026 financials, purely to demonstrate the three tracks.
Notable data points baked in from research:

- **Wendt India** — promoter is now ~37.5% (Wendt GmbH sold its stake via OFS in
  May 2025), so it fails Track A. The old "75%" thesis is gone.
- **Panasonic Energy India** — promoter ~58% (not 75%); NSE symbol `PANAENERG`.
- **Swaraj Engines** — promoter ~52% (Kirloskar exited to M&M in 2022).
- **Fuji / Tsukishima / Dai-Dan** — real net cash but P/B ≥ 1, so they are *not*
  net-nets and fail Track B.
- **Sical Logistics** — under ASM (trades ~weekly), fails the liquidity gate.
- **Frasers / Swire B / Dillard's / Telecom Italia** — dual-class / mega-cap
  situations that exceed the value-track market-cap ceiling.

> ⚠️ Seed financials are approximate and for demonstration only. **Not investment
> advice.** Verify every figure against a primary source before acting.

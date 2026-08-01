# CourseBarvaz

**Early-positioning scanner for control-concentrated equities.**

Buy deep-discount, cash-rich companies *before* a corporate event forces value
out — the highest risk/reward, lowest-complexity corner of the event-driven
landscape. Two theses, two markets:

- **Phase A — Japan / Oyako Jojo (親子上場).** Listed subsidiaries of listed
  parents, trading below net asset value while the TSE openly pressures parents
  to resolve the double listing. Buy a profitable, net-cash-rich sub at
  `P/B < 0.8` and the downside is capped while you wait for a tender.
- **Phase B — India / SEBI 75%.** Profitable companies where the promoter has
  crept to **72%–75%**, the regulatory ceiling. Out of room to accumulate
  on-market, with a cheap Fixed-Price delisting route available — a
  delisting/open-offer candidate you position ahead of.
- **Phase C — Safety Gate.** A hard, cross-cutting filter applied to *every*
  candidate: no pledged promoter stock, net-cash positive, operating profit.
  Capital preservation is the whole edge of positioning early.

Why this niche: equity fundamentals are cheap and easy to pipe into Python
(no Bloomberg/TRACE feeds), the regulators supply the tailwind, the deep
balance-sheet discount protects the downside, and there's no HFT speed race —
you accumulate quietly and wait.

## Install

Pure standard library — no runtime dependencies.

```bash
pip install -e .          # the package + `coursebarvaz` CLI
pip install -e ".[dev]"   # + pytest
pip install -e ".[yfinance]"  # + live market data provider
```

## Run

```bash
# Scan the bundled illustrative sample data:
python -m coursebarvaz --data data/japan_sample.csv data/india_sample.csv

# One market, and show *why* names were filtered out:
python -m coursebarvaz --data data/india_sample.csv --market IN --show-rejected

# Machine-readable output:
python -m coursebarvaz --data data/*.csv --json
```

Results are ranked by a risk/reward score (deeper discount + fatter cash
cushion for Japan; closer to the 75% ceiling + cheaper entry for India).

## Real seed dataset

`data/real_india.csv` and `data/real_japan.csv` hold a small, **hand-verified**
set of real companies (collected Aug 2026). Every figure is documented with its
source, date, and a confidence tag in [`data/SOURCES.md`](data/SOURCES.md) —
nothing is invented; unverifiable magnitudes are tagged `Approx`.
[`data/events_validation.md`](data/events_validation.md) records real *completed*
events in these categories (e.g. Toyota Industries `6201` taken private and
delisted Jun 2026) as evidence the mechanism is real.

```bash
python -m coursebarvaz --data data/real_india.csv data/real_japan.csv --show-rejected
```

What the real data shows today: **Sun TV Network** qualifies (promoter parked at
the 75% ceiling, zero pledge, huge net cash, P/B 1.74). **Wipro** and
**Honeywell Automation India** are in-band on ownership but fail the valuation
gate, and **Toyoda Gosei** — a genuine Toyota subsidiary trading *below book*
(P/B 0.97) — still misses the strict Phase-A bar (needs P/B < 0.8 **and** net
cash > 50% of market cap). The takeaway: the criteria are demanding, and real
qualifiers are rare — which is the point of a discipline. Thresholds live in
`config.py` if you want to relax them.

> This is a **seed**, not a backtest. Refresh against primary filings (BSE/NSE,
> EDINET, company IR) before acting, and see the disclaimer below.

## Bring your own data

The scanner is provider-agnostic. The default `CsvProvider` reads a CSV whose
columns mirror the `Company` model — crucially including the fields a free
price feed *can't* give you (promoter holding, pledged shares, parent links).
See `data/*_sample.csv` for the schema.

To wire up a real feed, implement `providers.base.DataProvider`. An optional
`YFinanceProvider` is included for the market-derived fields (price, book,
cash, debt, earnings); merge it on top of a curated CSV for the event fields.

Roadmap for real feeds: **EDINET** (Japan filings) and **BSE/NSE** bulk
disclosures (India promoter holdings & pledges).

## Architecture

```
provider ──> metrics ──> scanner (thesis) ──> safety gate ──> ranked results
```

```
src/coursebarvaz/
  models.py            Company / Metrics / Signal / ScanResult
  config.py            Tunable thresholds (P/B, net-cash, promoter band, gate)
  providers/           DataProvider seam: CsvProvider, YFinanceProvider
  scanners/
    japan.py           Phase A — Oyako Jojo
    india.py           Phase B — SEBI 75% promoter
  safety.py            Phase C — Safety Gate (applied to all candidates)
  engine.py            Orchestration + ranking
  cli.py               `python -m coursebarvaz`
```

Every verdict is auditable: each result carries the individual `Signal`s that
passed or failed, so you can see exactly why a name qualified or was rejected.

## Test

```bash
pytest
```

## Disclaimer

Research tooling only — **not** investment advice. The bundled `data/*.csv`
files contain **illustrative, synthetic** figures for demonstration, not real
company fundamentals. Verify all data against primary sources before acting.

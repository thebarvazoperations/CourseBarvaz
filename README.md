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

## Does the method work? — historical backtest

`python -m coursebarvaz.backtest` scores a curated set of **real completed and
failed** control-concentration events (Japanese parent-subsidiary buyouts, Indian
promoter delistings) — see [`data/historical_events.csv`](data/historical_events.csv)
and [`data/HISTORICAL_SOURCES.md`](data/HISTORICAL_SOURCES.md).

What the real events say (29 events, 23 completed → 79% win rate):

- **The payoff when it triggers is meaningful:** median early-entry premium
  **~+34%**, ranging from +13% (LINE) to +166% (Hitachi Transport).
- **Entering early is a real edge:** on deals reporting both premiums, early
  positioners captured **+34%** vs **+30%** for news-day buyers — and in the
  standout cases the gap is huge (Hitachi Metals: **15.1%** on the news vs
  **74.5%** for someone positioned before the speculation).
- **The two markets are structurally different** — the most important finding:

  | | n | win rate | median premium |
  |---|---|---|---|
  | **Japan** parent-buyouts / MBO | 23 | ~96% | +34% |
  | **India** RBB delistings | 6 | ~17%* | +58% |

  Across 23 Japanese control-concentration deals, only one failed (the Seven & i
  founding-family MBO, scrapped 2025) — when a controlling *parent* buys out the
  minority it controls the vote and it happens; the failures cluster in MBOs
  (activist pushback) and Indian delistings (promoter walks from a high price).

  Japan buyouts almost always complete (the parent controls the vote) at moderate
  premiums; Indian delistings are lottery-like — they fail often (the promoter
  walks from a high discovered price: Linde, INEOS, Elantas all collapsed) but
  pay big when they land. *SEBI's broad 2015–18 data puts the true India success
  rate at ~53% with a ~125% median premium; my small sample over-weights the
  (newsworthy) failures.

- **It's slow and uncertain:** holding-to-close ran from ~1.5 months (NTT Data)
  to ~18 months (Hitachi Metals).

**Honest verdict:** the mechanism is real and the early-positioning premium is
large and repeatable *when an event occurs* — getting in early clearly beats
reacting to the announcement, and Japan parent-buyouts are the higher-probability
leg while India is the higher-payoff, lower-odds leg. **What this backtest cannot
tell you** is the blended per-dollar-year return, because it only contains
*announced* deals — it omits the setups that never triggered (dead money).
Establishing a true expectancy needs a live universe tracked over time (below).
Treat the annualized figures as illustrative only.

## Did the criteria catch the winners? (No — and that matters)

`python -m coursebarvaz.criteria_check` reconstructs each event's
**pre-announcement** fundamentals, runs them through the *same* `ScanEngine`, and
asks: would the criteria have flagged this name *before* it paid off — and how
long did it then take? See [`data/preevent_fundamentals.csv`](data/preevent_fundamentals.csv)
(values reconstructed via search, confidence-tagged).

The result on 8 reconstructed events is stark: **capture rate 0/6 completed
deals — the current criteria would have flagged none of them.** Every winner was
excluded, each for a documented reason:

| Winner | Event paid | Why the criteria missed it |
|---|---|---|
| NTT Docomo | +40% | P/B 1.74 (needs < 0.8); net cash too thin |
| Sony Financial | +26% | P/B 1.65; insurer, ~no net cash |
| Shinko Electric | +19% | net cash only ~7% of mcap (needs > 50%) |
| Taisho Pharmaceutical | +55% | deep-value **and** cash-rich — but an **MBO**, no *listed* parent |
| Toyota Industries | (paid) | net debt from finance ops (needs net cash) |
| Hexaware | +58% | PE owner at ~62% (needs promoter 72–75%); P/B too high |

**This is the single most important finding.** The Phase-A/B criteria are
calibrated for a deep-value, cash-box, near-ceiling setup that is *very rare* —
so while they protect capital superbly (see the safety gate), they also miss the
overwhelming majority of real events, which happen to normally-valued
subsidiaries with ordinary balance sheets. The safety/breadth trade-off is now
measurable, not hypothetical. If the goal is to *catch events* rather than only
to hold the safest possible names, the thresholds (`config.py`) need loosening —
and this tool lets you re-run the capture rate as you retune them.

## Calibrating the criteria (the feedback loop)

`criteria_check` takes threshold overrides, so you can retune and watch the
capture rate move:

```bash
# As built: catches 0 of the reconstructed winners.
python -m coursebarvaz.criteria_check
# Loosen Japan (P/B ≤ 2.0, net cash ≥ 0): now catches NTT Docomo + Sony Financial.
python -m coursebarvaz.criteria_check --jp-max-pb 2.0 --jp-min-netcash 0.0
```

Loosening P/B from 0.8→2.0 and dropping the 50%-net-cash rule lifts capture from
**0% → 33%** while the safety gate (net-cash-positive, operating profit, no
pledge) still vetoes the genuinely weak balance sheets (Toyota Industries' net
debt stays excluded). That is the safety/breadth dial, in your hands.

`--sweep` grids the whole surface to find the knee:

```
                 P/B<=0.8  1.0   1.5   2.0   2.5   3.0
  net-cash>=0.5    0/8    0/8   0/8   0/8   0/8   0/8   <- the 50% rule alone kills everything
  net-cash>=0.0    0/8    1/8   1/8   3/8   4/8   4/8   <- knee at P/B<=2.5, net-cash>=0
```

The capture rate caps at ~50% even fully loosened, because the rest are net-debt
names the safety gate correctly vetoes (NTT Data, Toyota Industries) or MBOs with
no *listed* parent that the Oyako-Jojo scanner structurally can't see (Taisho,
Roland). That ceiling is baked into `config.CALIBRATED` (`P/B ≤ 2.5`,
`net-cash ≥ 0`).

## The $100k / 5-year scenario

`python -m coursebarvaz.portfolio` runs a **transparent scenario** (not a real
price backtest — premiums stand in for entry→exit) of $100k from 2021-08 to
2026-08, and deliberately brackets the honest range:

| Scenario | End value | Total | CAGR |
|---|---|---|---|
| **STRICT** (criteria as built → 0 trades, cash only) | **$115,937** | +15.9% | +3.0% |
| **CALIBRATED** (only what a retuned scanner flags) | **$157,816** | +57.8% | +9.5% |
| **OPPORTUNITY CEILING** (captured every in-window deal) | **$194,551** | +94.6% | +14.2% |

Three honest points, floor to ceiling:
- **STRICT is what the tool as built would actually have done** — nothing, so
  just cash yield (+3%/yr).
- **CALIBRATED is the realistic target:** run the `config.CALIBRATED` thresholds
  over the reconstructed pre-event data and it flags exactly the deals a retuned,
  still-safety-gated scanner would have caught — Hitachi Transport (+166%) and
  Shinko (+19%) — and it correctly **avoids** the Seven & i MBO that failed. That
  is ~9.5%/yr, off two positions in five years.
- **CEILING assumes you caught every in-window deal**, now including the Seven & i
  failure (flat), which no configuration delivers.

The in-window sample used to be all winners; adding the Seven & i failure and
widening the event set de-biases it, though the ceiling still overstates reality
(premiums ignore slippage/tax, and a failed deal really drops ~-9%, not 0%).

**Read the caveats in the module docstring before quoting any number:** no real
prices, premiums overstate real fills, the in-window sample is all winners (this
dataset's failures predate 2021), and position-sizing/redeployment assumptions
drive much of the ceiling. It is a scenario, not a track record.

## Scaling to hundreds of live candidates

The hosted sandbox blocks financial-data feeds, so the live pull is a script you
run **on your own machine**: [`scripts/build_universe.py`](scripts/build_universe.py)
fetches market fields via yfinance for a ticker list and merges your event-field
overrides (promoter %, pledges, parent links from screener.in / BSE-NSE / EDINET)
into a scanner-ready CSV.

```bash
pip install yfinance
python scripts/build_universe.py --tickers tickers.txt --overrides overrides.csv --out data/universe.csv
python -m coursebarvaz --data data/universe.csv --show-rejected
```

Run it periodically and archive each snapshot: that stream of flagged setups is
exactly the denominator the backtest is missing.

## Blended expectancy — closing the denominator

The tracking layer turns the conditional backtest into a real per-setup number.
Record every scan as a dated snapshot, then join the accumulated setups against
realized events:

```bash
# 1) record what the screener flags, on a schedule (builds the history):
python -m coursebarvaz --data data/universe.csv --save-snapshot data/snapshots

# 2) months/years later, compute the blended expectancy incl. the misses:
python -m coursebarvaz.expectancy --snapshots data/snapshots --events data/historical_events.csv
```

For each setup (first flagged on date D) the engine looks for an event on the
same ticker within a horizon (default 3y): a completed deal pays its early-entry
return, a failed deal pays `--fail-return`, and a setup that never triggers is a
**miss** paying `--miss-return` (default 0%). The blended mean across *all*
setups — winners and dead money — is the number that actually tells you if the
strategy pays per dollar deployed.

The bundled `data/snapshots/2021-01-15.json` is an **illustrative back-fill** (so
the pipeline shows hits *and* misses): 6 setups, 50% hit rate, +86.5% mean on
winners → **+43.2% blended per setup over 3 years (~+13%/yr)** even assuming 0%
on every miss. That asymmetry — modest hit rate, huge winners, protected
downside — is the strategy's core claim, now measurable. But it is only as real
as the snapshot history behind it: **collect snapshots forward, never back-fill,
to trust the number.**

## Automated forward collection (GitHub Actions)

`.github/workflows/monthly-snapshot.yml` runs on the 1st of each month: it
refreshes the universe from `data/tickers.txt` + `data/overrides.csv` via
yfinance (GitHub runners have internet, unlike the Claude sandbox), scans, saves
a dated snapshot, and commits it back to the repo. If the universe pull fails it
falls back to the committed `data/real_*.csv`, so it always records *something*.

- Edit `data/tickers.txt` (one `ticker market name` per line) to grow the
  universe toward hundreds; put verified event fields (promoter %, pledges,
  parent links) in `data/overrides.csv`.
- Scheduled workflows fire only from the **default branch**, so merge this branch
  to enable the cron. Until then use the **Run workflow** button
  (`workflow_dispatch`).

This is what makes the expectancy number trustworthy over time: the snapshots
accumulate forward, automatically, without anyone having to remember.

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

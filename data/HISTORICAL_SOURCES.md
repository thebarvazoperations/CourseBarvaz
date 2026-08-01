# Historical events — sources and method

Real, completed (and failed) control-concentration events used by
`src/coursebarvaz/backtest.py`. Collected **August 2026** via web search.
Premiums are recorded as reported; `premium_early` is the strategy-relevant
number (vs the pre-speculation price), `premium_1d` is the news-day premium.

## Japan — parent buys out a listed subsidiary (and controlling-family MBO)

| Event | Offer | Premium (1d / early) | Hold | Outcome | Source |
|---|---|---|---|---|---|
| **NTT Docomo** (9437), parent NTT | ¥3,900 | ~40.5% / 40.5% | ~3 mo | completed | NTT bought out minority, ~$40B, >40% premium (Bloomberg, 2020) |
| **Hitachi Metals** (5486), Bain (Hitachi 53.38%) | ¥2,181 | **15.1% / 74.5%** | ~18 mo | completed | 15.1% 1-day but 74.5% vs pre-speculation Oct-2019 (Manalo Advisors / Bain) |
| **Hitachi Transport** (9086), KKR (Hitachi 40%) | ¥8,913 | — / **166%** | ~7 mo | completed | 166% premium to 12-mo average (Bloomberg, 2022) |
| **Shinko Electric** (6967), JIC (Fujitsu 50.02%) | ¥5,920 | 13.0% / 18.9% | ~15 mo | completed | 13% 1-day, 18.9% undisturbed 31-May-23; long regulatory delay (MLex / JIC) |
| **Taisho Pharma** (4581), Uehara-family MBO | ¥8,620 | 55% / 55% | ~2 mo | completed | 55% announce-day premium, ¥710B (Bloomberg / Nikkei, 2023) |
| **Toyota Industries** (6201), Toyota group | ¥20,600 | — / *ambiguous* | ~10 mo | completed | Initial ¥16,300 = −11% to close, raised to ¥20,600; delisted Jun-2026 (CNBC). Excluded from premium averages |

## India — promoter delisting / open offer near the 75% ceiling

| Event | Offer | Premium | Hold | Outcome | Source |
|---|---|---|---|---|---|
| **Hexaware** (532129), Baring (~62%) | ₹475 | ~58% (vs undisturbed) / 67% vs floor ₹285 | ~2.5 mo | completed | RBB delisting accepted ₹475 (Business Standard, 2020) |
| **Vedanta** (500295), promoter | ₹87.5 floor | — | — | **failed** | Delisting failed; later open offer ₹235 only 58% subscribed (Business Standard, 2020–21) |
| **Linde India** (523457), Linde AG (~75%) | — | — | — | **failed** | Discovered ₹2,025 vs floor ₹428.5 rejected; +36% in 3d on plan, −20% on failure (Business Standard / Capitalmind, 2018–19) |

## Method & honest caveats
- `captured_return` = `premium_early` if present, else `premium_1d`. `annualized`
  = `(1+r)^(365/holding_days) − 1` — shown **illustratively**; a single event's
  premium cannot be continuously redeployed, so annualized figures overstate a
  repeatable rate. The report uses the **median** and flags it.
- **Selection bias:** only *announced* deals are here. The dataset does **not**
  include the screener setups that never got an event — the missing denominator.
  So this measures the payoff *conditional on an event*, and whether entering
  early beats entering on the news (it does: +16.3pp on deals with both
  premiums). It does **not** establish a blended per-dollar-year expectancy.
- Failed deals (Vedanta, Linde) are real and included in the win-rate (7/9 ≈
  78%), but note the sample is small and skewed toward well-known deals.
- To turn this into a true expectancy, track a live universe of setups over time
  (see `scripts/build_universe.py`) and record, for every flagged name, whether
  an event followed within N years and the realized return including the misses.

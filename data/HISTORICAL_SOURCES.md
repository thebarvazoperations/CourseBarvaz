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
| **Sony Financial** (8729), parent Sony | ¥2,600 | 26% / 26% | ~3 mo | completed | ¥2,600 vs ¥2,064; 26% premium, ~$3.7B (Cleary Gottlieb / Insurance Journal, 2020) |
| **NTT Data** (9613), NTT (57.73%) | ¥4,000 | 33.7% / 33.7% | ~1.5 mo | completed | 33.7% vs ¥2,991.5; ~¥2.37T; then two-thirds squeeze-out (NTT / Manalo Advisors, 2025) |
| **LINE Corp** (3938), SoftBank/Naver JV | ¥5,200 | 13% / 13% | ~7 mo | completed | 13% premium before news; Yahoo Japan/LINE integration (SoftBank, 2020) |
| **Roland DG** (6789), Taiyo Pacific Partners | ¥5,035 | 30% / 30% | ~3 mo | completed | ~30% vs 2023-09-09 close; large holder took it private (World Imaging News, 2024) |
| **Benefit One** (2412), Dai-ichi (Pasona 51.16%) | ¥2,173 | — / *bid war* | ~4 mo | completed | Bid war M3 vs Dai-ichi 1,600→2,173 (Bloomberg / Japan Times, 2024). Excluded from premium averages |
| **FamilyMart** (8028), Itochu (~50%) | ¥2,300 | 31% / 31% | ~1.5 mo | completed | 31% premium; court later ruled fair value ¥2,600 — minorities won appraisal (Japan Times / Bloomberg, 2020) |
| **Hitachi Chemical** (4217), Showa Denko (Hitachi 51%) | ¥4,630 | 34% / 34% | ~4 mo | completed | 34% vs 2019-11-25; Hitachi group unwind, ~$8.8B (Bloomberg, 2019) |
| **Hitachi Kokusai** (6756), KKR/JIP (Hitachi ~52%) | ¥2,503 | — / **62.5%** | ~7 mo | completed | 62.46% premium to 12-mo average (Business Wire / KKR, 2017) |
| **PanaHome** (1924), Panasonic (~54%) | ¥1,200 | 16.4% / 16.4% | ~3 mo | completed | 16.4% premium; Panasonic bought out housing subsidiary (Yahoo/Reuters, 2016–17) |
| **Nichii Gakkan** (9792), Bain (founder-backed) | ¥1,500 | 37% / 37% | ~3 mo | completed | 37% vs 2020-05-07; later sweetened vs Effissimo (DealStreetAsia / AVCJ, 2020) |

**Prominent deals deliberately EXCLUDED** (to keep the dataset thesis-pure — a
pre-existing *controlling* parent/promoter buying out minorities): JSR/JIC and
Toshiba/JIP (government-fund / PE take-privates, no controlling parent), Ci:z/J&J
and Tokyo Dome/Mitsui Fudosan (ordinary acquisitions, no prior control), and
Pioneer/Baring (a distressed *take-under* below market, not a premium event).

## India — promoter delisting / open offer near the 75% ceiling

| Event | Offer | Premium | Hold | Outcome | Source |
|---|---|---|---|---|---|
| **Hexaware** (532129), Baring (~62%) | ₹475 | ~58% (vs undisturbed) / 67% vs floor ₹285 | ~2.5 mo | completed | RBB delisting accepted ₹475 (Business Standard, 2020) |
| **Vedanta** (500295), promoter | ₹87.5 floor | — | — | **failed** | Delisting failed; later open offer ₹235 only 58% subscribed (Business Standard, 2020–21) |
| **Linde India** (523457), Linde AG (~75%) | — | — | — | **failed** | Discovered ₹2,025 vs floor ₹428.5 rejected; +36% in 3d on plan, −20% on failure (Business Standard / Capitalmind, 2018–19) |
| **INEOS Styrolution** (506222), INEOS (~75%) | — | — | — | **failed** | Promoter rejected discovered ₹1,100; stock −20% (Business Standard / Indian Chemical News, 2020) |
| **Elantas Beck** (500123), Altana (~75%) | — | — | — | **failed** | RBB ₹600 vs offer ₹330; too few of 11.45% non-promoter tendered (Business Standard). Dates approximate |

### India aggregate cross-check (SEBI)
A SEBI study of RBB delistings **2015–2018** found **53% succeeded**, at a **median
premium of ~125%**. This corroborates the shape my small sample shows — Indian
delistings are lottery-like: a coin-flip on completion, but a very large premium
when they land. My hand-picked sample (n=5, 20% success) over-weights failures
(they were newsworthy); treat the true India hit rate as ~50%, not 20%.

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

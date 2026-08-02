# Real dataset — sources, dates, and confidence

Every figure in `real_india.csv` and `real_japan.csv` is recorded here with its
source, the date it was reported, and a confidence tag. **Nothing is invented.**
Where a field could not be sourced directly it is either derived transparently
(and tagged `Derived`) or marked `Approx` (only the *sign* is established, e.g.
"the company is profitable", and the magnitude is a placeholder pending a
primary-source refresh).

Data collected **August 2026** via web search (see per-row links). This is a
**seed** — small by design, because it is hand-verified. Refresh against primary
filings (BSE/NSE, EDINET, company IR) before acting on any of it.

Confidence tags: `Sourced` (a source states the number directly) ·
`Derived` (computed from other sourced numbers) · `Approx` (only the sign is
established; magnitude is a placeholder).

Units — kept internally consistent per row (the scanner only uses ratios):
India in **₹ crore**, Japan in **¥ billion**.

---

## India (`real_india.csv`) — ₹ crore

### SUNTV.NS — Sun TV Network — **QUALIFIES**
| Field | Value | Tag | Note / source |
|---|---|---|---|
| promoter_holding_pct | 0.7500 | Sourced | Promoters hold 75.00%, 0% pledged |
| pledged_shares_pct | 0 | Sourced | 0% pledged |
| pb (→ book_value) | 1.74 → 11,662 | Sourced / Derived | P/B 1.74; book = mcap / P/B |
| market_cap | 20,291 | Sourced | ~₹20,291 Cr (Jul 2026) |
| cash_and_equivalents | 6,100 | Sourced | ₹61.0b cash |
| total_debt | 30 | Sourced | ₹303.7m debt (≈ ₹30 Cr) |
| net_income | 1,900 | Approx | PAT clearly positive (FCF ₹1,279 Cr FY25, "almost debt free, strong profitability"); magnitude is a placeholder |
| operating_income | 2,400 | Approx | Operating profit positive; magnitude placeholder |
- Why it qualifies: promoter parked **exactly at the 75% ceiling** (no room to
  accumulate on-market), zero pledge, huge net cash (₹6,070 Cr), debt-free,
  profitable, P/B 1.74 under the ≤3.0 valuation gate.

### WIPRO.NS — Wipro — **rejected (valuation gate)**
| Field | Value | Tag | Note / source |
|---|---|---|---|
| promoter_holding_pct | 0.7262 | Sourced | 72.62% — inside the 72–75% band |
| pb (→ book_value) | 3.27 → 55,624 | Sourced / Derived | P/B 3.27 (Jun 30 2025) |
| market_cap | 181,892 | Sourced | ₹1,81,892 Cr |
| cash_and_equivalents | 54,324 | Sourced | ₹543.24b cash |
| total_debt | 20,291 | Sourced | ₹202.91b debt (net cash ₹340.33b) |
| net_income | 12,600 | Sourced (approx) | LTM profit ~$1.52b ≈ ₹12,600 Cr; Q3 FY26 PAT ₹3,119 Cr |
| operating_income | 15,000 | Approx | EBIT positive; magnitude placeholder |
- Why rejected: promoter is in-band and it is net-cash rich, **but P/B 3.27 >
  the 3.0 valuation gate** — you would be buying the ceiling, not a discount.
  A close, instructive miss (the gate is tunable in `config.py`).

### HONAUT.NS — Honeywell Automation India — **rejected (valuation gate)**
| Field | Value | Tag | Note / source |
|---|---|---|---|
| promoter_holding_pct | 0.7500 | Sourced | Promoter (Honeywell) 75% (Jun 2025) |
| pb (→ book_value) | 7.83 → 4,468 | Sourced / Derived | trades at 7.83× book |
| market_cap | 34,984 | Sourced | ₹34,984 Cr |
| cash_and_equivalents | 3,130 | Sourced | cash & investments ₹3,130 Cr, zero long-term debt |
| total_debt | 0 | Sourced | debt-free |
| net_income | 500 | Approx | profitable; magnitude placeholder |
| operating_income | 650 | Approx | profitable; magnitude placeholder |
- Why rejected: promoter at the ceiling and debt-free, **but P/B 7.83 is far
  above the valuation gate** — an expensive quality compounder, not a
  deep-value pre-event setup.

---

## Japan (`real_japan.csv`) — ¥ billion

### 7282.T — Toyoda Gosei — **rejected (not deep enough / not net-cash rich)**
| Field | Value | Tag | Note / source |
|---|---|---|---|
| has_listed_parent / parent | true / 7203.T @ 0.44 | Sourced | Toyota Motor is largest shareholder, 44% |
| pb (→ book_value) | 0.97 → 562.1 | Sourced / Derived | P/B 0.97 (below book) |
| market_cap | 545.224 | Sourced | ¥545.224B (May 2026) |
| cash_and_equivalents | 148.74 | Sourced | ¥148.74B total cash |
| total_debt | 112.4 | Derived | D/E ≈ 20% × equity ¥562B → net cash ≈ ¥36B |
| net_income | 36.3 | Sourced | ¥36.3B FY2025 (−29% YoY) |
| operating_income | 40.0 | Approx | operating profit positive; magnitude placeholder |
- Why rejected — **the key lesson of this dataset:** it is a genuine listed
  Toyota subsidiary trading *below book* (P/B 0.97), yet it fails **both** strict
  Japan gates: P/B 0.97 > 0.80 (not a deep discount) and net cash is only ~7% of
  market cap, far under the >50% requirement. Your Phase-A criteria are
  demanding — most below-book subsidiaries do **not** clear them.

---

## Sources
- Sun TV: promoter/pledge, cash/debt, P/B — Simply Wall St, Trendlyne, Screener.
- Wipro: promoter 72.62% (Trendlyne/Angel One), P/B & cash/debt (StockAnalysis, company 6-K).
- Honeywell Automation India: promoter 75% & balance sheet (Simply Wall St, Business Standard).
- Toyoda Gosei: Toyota 44% ownership (Simply Wall St), P/B/cash/net income (Yahoo Finance, Simply Wall St FY2025 results).
- See `events_validation.md` for real completed-event evidence (Toyota Industries 6201).

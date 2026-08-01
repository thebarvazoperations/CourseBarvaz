"""Domain model: the raw company snapshot, derived metrics, and scan output.

All monetary fields are expressed in the company's own reporting currency and
in the *same* units (typically millions). The scanner only ever works with
ratios, so the absolute unit does not matter as long as it is consistent
within a single :class:`Company` record.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Market(str, Enum):
    JAPAN = "JP"
    INDIA = "IN"


@dataclass
class Company:
    """A raw, provider-agnostic snapshot of a single listed company."""

    ticker: str
    name: str
    market: Market

    # Valuation
    market_cap: float
    book_value: float  # total common equity (book)

    # Balance-sheet cash position
    cash_and_equivalents: float = 0.0
    total_debt: float = 0.0

    # Profitability (trailing)
    net_income: float = 0.0
    operating_income: float = 0.0

    # --- Japan / Oyako Jojo specifics ---
    has_listed_parent: bool = False
    parent_ticker: Optional[str] = None
    parent_ownership_pct: Optional[float] = None  # fraction, e.g. 0.53

    # --- India / SEBI 75% specifics ---
    promoter_holding_pct: Optional[float] = None  # fraction, e.g. 0.735
    pledged_shares_pct: float = 0.0  # fraction of promoter holding pledged

    # Free-form provenance so results are auditable.
    source: str = "unknown"

    def __post_init__(self) -> None:
        if isinstance(self.market, str):
            self.market = Market(self.market)


@dataclass
class Metrics:
    """Derived, dimensionless metrics computed from a :class:`Company`."""

    pb_ratio: Optional[float]
    net_cash: float
    net_cash_to_mcap: Optional[float]
    is_profitable: bool
    is_operationally_profitable: bool
    is_debt_free: bool

    @classmethod
    def of(cls, c: Company) -> "Metrics":
        pb = c.market_cap / c.book_value if c.book_value > 0 else None
        net_cash = c.cash_and_equivalents - c.total_debt
        ncm = net_cash / c.market_cap if c.market_cap > 0 else None
        return cls(
            pb_ratio=pb,
            net_cash=net_cash,
            net_cash_to_mcap=ncm,
            is_profitable=c.net_income > 0,
            is_operationally_profitable=c.operating_income > 0,
            # "Debt-free" here means net-cash positive, not literally zero debt.
            is_debt_free=net_cash >= 0,
        )


@dataclass
class Signal:
    """One reason a company did (or didn't) qualify, for auditability."""

    label: str
    passed: bool
    detail: str = ""

    def __str__(self) -> str:  # pragma: no cover - cosmetic
        mark = "✓" if self.passed else "✗"
        return f"{mark} {self.label}: {self.detail}".rstrip()


@dataclass
class ScanResult:
    """The outcome of running one scanner + the safety gate over a company."""

    company: Company
    metrics: Metrics
    scanner: str
    qualified: bool
    score: float = 0.0
    signals: list[Signal] = field(default_factory=list)

    @property
    def failed_signals(self) -> list[Signal]:
        return [s for s in self.signals if not s.passed]

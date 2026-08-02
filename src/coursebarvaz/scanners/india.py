"""Phase B — India / SEBI 75% promoter-ceiling scanner.

Thesis: SEBI caps promoter holding at 75%. A profitable company where the
promoter has quietly crept to 72%–75% is a delisting/open-offer candidate — the
promoter is out of room to accumulate on-market and the cheap Fixed-Price
delisting route makes taking it private attractive. We position before that.
"""

from __future__ import annotations

from ..config import IndiaCriteria
from ..models import Company, Market, Metrics, Signal
from .base import Scanner


class IndiaPromoterScanner(Scanner):
    name = "india-75-promoter"
    market = Market.INDIA

    def __init__(self, criteria: IndiaCriteria) -> None:
        self.c = criteria

    def evaluate(self, company: Company, metrics: Metrics) -> tuple[bool, list[Signal]]:
        signals: list[Signal] = []

        h = company.promoter_holding_pct
        band_ok = h is not None and self.c.min_promoter_holding <= h <= self.c.max_promoter_holding
        signals.append(Signal(
            "Promoter in approach band", band_ok,
            (f"{h:.1%} in [{self.c.min_promoter_holding:.0%}, {self.c.max_promoter_holding:.0%}]"
             if h is not None else "unknown promoter holding"),
        ))

        pb_ok = metrics.pb_ratio is None or metrics.pb_ratio <= self.c.max_pb
        signals.append(Signal(
            "Valuation gate", pb_ok,
            f"P/B {metrics.pb_ratio:.2f} <= {self.c.max_pb}" if metrics.pb_ratio is not None
            else "no book value (skipped)",
        ))

        profit_ok = metrics.is_profitable or not self.c.require_profitable
        signals.append(Signal(
            "Profitable", profit_ok,
            f"net income {'>' if metrics.is_profitable else '<='} 0",
        ))

        return all(s.passed for s in signals), signals

    def score(self, company: Company, metrics: Metrics) -> float:
        # The closer to 75%, the less room to accumulate on-market -> more
        # pressure toward an open offer / delisting.
        h = company.promoter_holding_pct or 0.0
        proximity = max(0.0, min(1.0, (h - self.c.min_promoter_holding)
                                 / max(1e-9, self.c.max_promoter_holding - self.c.min_promoter_holding)))
        # A little extra credit for a cheaper entry.
        discount = max(0.0, 1.0 - (metrics.pb_ratio or 1.0))
        return round(70 * proximity + 30 * min(1.0, discount), 2)

"""Phase A — Japan / Oyako Jojo (親子上場) deep-discount scanner.

Thesis: the TSE is publicly pressuring listed parents to resolve listed
subsidiaries trading below book (P/B < 1). A profitable, net-cash-rich
subsidiary at P/B < 0.8 has a hard floor under it — the parent can tender at a
premium and it is *still* cheap — so the downside is small while we wait.
"""

from __future__ import annotations

from ..config import JapanCriteria
from ..models import Company, Market, Metrics, Signal
from .base import Scanner


class JapanOyakoScanner(Scanner):
    name = "japan-oyako-jojo"
    market = Market.JAPAN

    def __init__(self, criteria: JapanCriteria) -> None:
        self.c = criteria

    def evaluate(self, company: Company, metrics: Metrics) -> tuple[bool, list[Signal]]:
        signals: list[Signal] = []

        pb_ok = metrics.pb_ratio is not None and metrics.pb_ratio <= self.c.max_pb
        signals.append(Signal(
            "P/B discount", pb_ok,
            f"{metrics.pb_ratio:.2f} <= {self.c.max_pb}" if metrics.pb_ratio is not None
            else "no book value",
        ))

        ncm = metrics.net_cash_to_mcap
        cash_ok = ncm is not None and ncm >= self.c.min_net_cash_to_mcap
        signals.append(Signal(
            "Net-cash cushion", cash_ok,
            f"{ncm:.0%} of mcap >= {self.c.min_net_cash_to_mcap:.0%}" if ncm is not None
            else "no market cap",
        ))

        parent_ok = company.has_listed_parent or not self.c.require_listed_parent
        signals.append(Signal(
            "Listed parent", parent_ok,
            (f"parent {company.parent_ticker} @ {company.parent_ownership_pct:.0%}"
             if company.has_listed_parent and company.parent_ownership_pct is not None
             else "listed parent present" if company.has_listed_parent
             else "no listed parent"),
        ))

        profit_ok = metrics.is_profitable or not self.c.require_profitable
        signals.append(Signal(
            "Profitable", profit_ok,
            f"net income {'>' if metrics.is_profitable else '<='} 0",
        ))

        return all(s.passed for s in signals), signals

    def score(self, company: Company, metrics: Metrics) -> float:
        # Reward deeper discounts and fatter cash cushions.
        discount = max(0.0, 1.0 - (metrics.pb_ratio or 1.0))          # 0..1
        cushion = min(1.0, max(0.0, metrics.net_cash_to_mcap or 0.0))  # capped at 1
        return round(60 * discount + 40 * cushion, 2)

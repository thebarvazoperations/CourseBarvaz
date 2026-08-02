"""Phase C — the Safety Gate.

Capital preservation is the whole edge of positioning *early*: we only get to
"wait patiently for the event" if the balance sheet can't blow up while we
wait. This gate is applied to every candidate after its thesis scanner and
vetoes anything with pledged promoter stock, net debt, or an operating loss —
regardless of how attractive it otherwise looks.
"""

from __future__ import annotations

from .config import SafetyGate
from .models import Company, Metrics, Signal


class SafetyEvaluator:
    def __init__(self, gate: SafetyGate) -> None:
        self.g = gate

    def evaluate(self, company: Company, metrics: Metrics) -> tuple[bool, list[Signal]]:
        signals: list[Signal] = []

        pledge_ok = company.pledged_shares_pct <= self.g.max_pledged_shares
        signals.append(Signal(
            "No pledged shares", pledge_ok,
            f"{company.pledged_shares_pct:.1%} pledged (max {self.g.max_pledged_shares:.0%})",
        ))

        cash_ok = metrics.net_cash >= 0 or not self.g.require_net_cash_positive
        signals.append(Signal(
            "Net-cash positive", cash_ok,
            f"net cash {metrics.net_cash:,.0f}",
        ))

        op_ok = metrics.is_operationally_profitable or not self.g.require_operating_profit
        signals.append(Signal(
            "Operating profit", op_ok,
            f"operating income {'>' if metrics.is_operationally_profitable else '<='} 0",
        ))

        return all(s.passed for s in signals), signals

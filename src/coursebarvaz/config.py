"""Tunable thresholds for the scanners and the safety gate.

Every number here maps directly to a criterion described in the strategy:
deep P/B discount, large net-cash cushion, promoter parked just under the
75% ceiling, and a hard balance-sheet safety gate.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class JapanCriteria:
    """Phase A — Oyako Jojo (listed parent/subsidiary) deep-discount setup."""

    max_pb: float = 0.8              # trade below net asset value
    min_net_cash_to_mcap: float = 0.5  # > 50% of market cap in net cash
    require_listed_parent: bool = True
    require_profitable: bool = True


@dataclass(frozen=True)
class IndiaCriteria:
    """Phase B — promoter parked in the 72%–75% approach band to the ceiling."""

    min_promoter_holding: float = 0.72
    max_promoter_holding: float = 0.75
    require_profitable: bool = True
    # A modest valuation gate so we buy the discount, not the ceiling alone.
    max_pb: float = 3.0


@dataclass(frozen=True)
class SafetyGate:
    """Phase C — hard exclusions applied to every candidate, any market."""

    max_pledged_shares: float = 0.0      # zero tolerance for pledged promoter stock
    require_net_cash_positive: bool = True
    require_operating_profit: bool = True


@dataclass(frozen=True)
class Config:
    japan: JapanCriteria = JapanCriteria()
    india: IndiaCriteria = IndiaCriteria()
    safety: SafetyGate = SafetyGate()


DEFAULT = Config()

# Empirically calibrated from the capture-rate sweep (see criteria_check --sweep):
# loosening Japan to P/B <= 2.5 and dropping the 50%-net-cash rule to >= 0 lifts
# the capture rate of historical winners from 0% to ~50% while the safety gate
# still vetoes every net-debt balance sheet. India stays at the near-ceiling
# thesis. This trades breadth for a controlled amount of the safety margin.
CALIBRATED = Config(
    japan=JapanCriteria(max_pb=2.5, min_net_cash_to_mcap=0.0),
    india=IndiaCriteria(),
    safety=SafetyGate(),
)

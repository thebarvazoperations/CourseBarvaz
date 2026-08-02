"""The orchestration layer: provider -> scanners -> safety gate -> ranking.

Flow for each company:
  1. compute derived metrics;
  2. run the scanner matching its market;
  3. run the cross-cutting safety gate;
  4. a candidate *qualifies* only if it passes both;
  5. rank the survivors by the scanner's risk/reward score.
"""

from __future__ import annotations

from .config import Config, DEFAULT
from .models import Company, Market, Metrics, ScanResult
from .providers.base import DataProvider
from .safety import SafetyEvaluator
from .scanners.base import Scanner
from .scanners.india import IndiaPromoterScanner
from .scanners.japan import JapanOyakoScanner


class ScanEngine:
    def __init__(self, config: Config = DEFAULT) -> None:
        self.config = config
        self.safety = SafetyEvaluator(config.safety)
        self._scanners: dict[Market, Scanner] = {
            Market.JAPAN: JapanOyakoScanner(config.japan),
            Market.INDIA: IndiaPromoterScanner(config.india),
        }

    def scan(
        self,
        provider: DataProvider,
        market: Market | None = None,
        include_rejected: bool = False,
    ) -> list[ScanResult]:
        """Scan every company from ``provider`` and return ranked results.

        By default only qualifying candidates are returned. Pass
        ``include_rejected=True`` to get every evaluated company (useful for
        auditing *why* something was filtered out).
        """
        results: list[ScanResult] = []
        for company in provider.companies(market):
            result = self.evaluate(company)
            if result is None:
                continue
            if result.qualified or include_rejected:
                results.append(result)

        results.sort(key=lambda r: (r.qualified, r.score), reverse=True)
        return results

    def evaluate(self, company: Company) -> ScanResult | None:
        scanner = self._scanners.get(company.market)
        if scanner is None:
            return None

        metrics = Metrics.of(company)
        thesis_ok, thesis_signals = scanner.evaluate(company, metrics)
        safety_ok, safety_signals = self.safety.evaluate(company, metrics)

        qualified = thesis_ok and safety_ok
        return ScanResult(
            company=company,
            metrics=metrics,
            scanner=scanner.name,
            qualified=qualified,
            score=scanner.score(company, metrics) if qualified else 0.0,
            signals=thesis_signals + safety_signals,
        )

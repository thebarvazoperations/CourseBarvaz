"""Scanner interface.

A scanner encodes *one* thesis (Japan Oyako Jojo, India 75% promoter, …). It
looks only at a company + its derived metrics and returns a list of
:class:`Signal` objects plus a pass/fail verdict. Scoring and the cross-cutting
safety gate live elsewhere so a scanner stays a pure statement of its thesis.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..models import Company, Metrics, Signal


class Scanner(ABC):
    name: str
    market: object  # models.Market, avoided here to prevent an import cycle

    @abstractmethod
    def evaluate(self, company: Company, metrics: Metrics) -> tuple[bool, list[Signal]]:
        """Return ``(qualified, signals)`` for one company."""
        raise NotImplementedError

    @abstractmethod
    def score(self, company: Company, metrics: Metrics) -> float:
        """Rank qualifying candidates: higher == better risk/reward."""
        raise NotImplementedError

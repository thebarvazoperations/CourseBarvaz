"""The data-provider seam.

The whole point of this abstraction is that the scanning logic never knows
where a :class:`Company` came from. Today it is a CSV of hand-collected
fundamentals; tomorrow it can be EDINET, BSE/NSE bulk filings, or a paid feed —
without touching a single scanner.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable, Optional

from ..models import Company, Market


class DataProvider(ABC):
    """Yields raw company snapshots for one or more markets."""

    @abstractmethod
    def companies(self, market: Optional[Market] = None) -> Iterable[Company]:
        """Yield companies, optionally filtered to a single market."""
        raise NotImplementedError

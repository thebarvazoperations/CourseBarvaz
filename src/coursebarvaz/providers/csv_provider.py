"""A CSV-backed provider — the zero-dependency default.

The fields you cannot reliably get from a free price feed (promoter holding,
pledged shares, whether a listed parent exists) are exactly the ones that
matter most here, so the primary provider reads a curated CSV you control.
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterable, Optional

from ..models import Company, Market
from .base import DataProvider


def _f(row: dict, key: str, default: float = 0.0) -> float:
    val = row.get(key, "")
    if val is None or str(val).strip() == "":
        return default
    return float(val)


def _opt_f(row: dict, key: str) -> Optional[float]:
    val = row.get(key, "")
    if val is None or str(val).strip() == "":
        return None
    return float(val)


def _b(row: dict, key: str) -> bool:
    return str(row.get(key, "")).strip().lower() in {"1", "true", "yes", "y"}


class CsvProvider(DataProvider):
    """Reads one or more CSV files whose columns mirror :class:`Company`."""

    def __init__(self, *paths: str | Path) -> None:
        self.paths = [Path(p) for p in paths]

    def companies(self, market: Optional[Market] = None) -> Iterable[Company]:
        for path in self.paths:
            with open(path, newline="", encoding="utf-8") as fh:
                for row in csv.DictReader(fh):
                    company = self._row_to_company(row, source=str(path))
                    if market is None or company.market == market:
                        yield company

    @staticmethod
    def _row_to_company(row: dict, source: str) -> Company:
        return Company(
            ticker=row["ticker"].strip(),
            name=row["name"].strip(),
            market=Market(row["market"].strip()),
            market_cap=_f(row, "market_cap"),
            book_value=_f(row, "book_value"),
            cash_and_equivalents=_f(row, "cash_and_equivalents"),
            total_debt=_f(row, "total_debt"),
            net_income=_f(row, "net_income"),
            operating_income=_f(row, "operating_income"),
            has_listed_parent=_b(row, "has_listed_parent"),
            parent_ticker=(row.get("parent_ticker") or "").strip() or None,
            parent_ownership_pct=_opt_f(row, "parent_ownership_pct"),
            promoter_holding_pct=_opt_f(row, "promoter_holding_pct"),
            pledged_shares_pct=_f(row, "pledged_shares_pct"),
            source=source,
        )

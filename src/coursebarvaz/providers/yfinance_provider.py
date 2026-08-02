"""Optional yfinance-backed provider for the market-derived fields.

yfinance covers price, market cap, book value, cash, debt and earnings — but
*not* promoter holdings, pledges, or parent/subsidiary links. So this provider
is designed to be *merged on top of* a CSV that supplies those event fields:
it refreshes the market data while your curated CSV supplies the rest.

Import is lazy so the package works with zero third-party dependencies.
"""

from __future__ import annotations

from typing import Iterable, Optional

from ..models import Company, Market
from .base import DataProvider


class YFinanceProvider(DataProvider):
    """Fetch market-derived fundamentals for an explicit ticker list.

    Parameters
    ----------
    tickers:
        Mapping of ``ticker -> (name, market)``. yfinance needs suffixes such
        as ``.T`` (Tokyo) or ``.NS`` (NSE), which you provide here.
    """

    def __init__(self, tickers: dict[str, tuple[str, Market]]) -> None:
        self.tickers = tickers

    def companies(self, market: Optional[Market] = None) -> Iterable[Company]:
        try:
            import yfinance  # noqa: F401
        except ImportError as exc:  # pragma: no cover - env dependent
            raise RuntimeError(
                "yfinance is not installed. Run `pip install coursebarvaz[yfinance]`"
            ) from exc

        for ticker, (name, mkt) in self.tickers.items():
            if market is not None and mkt != market:
                continue
            company = self._fetch(ticker, name, mkt)
            if company is not None:
                yield company

    @staticmethod
    def _fetch(ticker: str, name: str, market: Market) -> Optional[Company]:
        import yfinance as yf

        info = yf.Ticker(ticker).info or {}
        market_cap = info.get("marketCap")
        book_value_ps = info.get("bookValue")
        shares = info.get("sharesOutstanding")
        if not market_cap or not book_value_ps or not shares:
            return None

        return Company(
            ticker=ticker,
            name=info.get("shortName") or name,
            market=market,
            market_cap=float(market_cap),
            book_value=float(book_value_ps) * float(shares),
            cash_and_equivalents=float(info.get("totalCash") or 0.0),
            total_debt=float(info.get("totalDebt") or 0.0),
            net_income=float(info.get("netIncomeToCommon") or 0.0),
            # yfinance exposes an operating-margin fraction, not an absolute.
            operating_income=float(info.get("operatingMargins") or 0.0)
            * float(info.get("totalRevenue") or 0.0),
            source=f"yfinance:{ticker}",
        )

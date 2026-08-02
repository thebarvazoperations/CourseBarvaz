"""Snapshot store — accumulate the denominator the backtest is missing.

The historical backtest only sees *announced* deals. To get a real expectancy you
have to record, at each point in time, the full set of setups the screener
flagged — including the ones that will never get an event. This module persists
those scan snapshots so that, months and years later, you can ask: of everything
I flagged back then, what fraction actually got an event, and what did the whole
basket return (winners *and* dead money)?

A snapshot is just a dated list of qualified setups. Store them as one JSON file
per scan date under a directory you keep in version control or object storage.
Run the scanner on a schedule; never delete old snapshots — they are the record.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import date
from pathlib import Path
from typing import Iterable

from .models import ScanResult


@dataclass(frozen=True)
class Setup:
    ticker: str
    name: str
    market: str
    scanner: str
    score: float


@dataclass
class Snapshot:
    as_of: str  # ISO date the scan was taken
    setups: list[Setup] = field(default_factory=list)
    note: str = ""

    @classmethod
    def from_results(cls, results: Iterable[ScanResult], as_of: str | None = None,
                     note: str = "") -> "Snapshot":
        as_of = as_of or date.today().isoformat()
        setups = [
            Setup(r.company.ticker, r.company.name, r.company.market.value,
                  r.scanner, r.score)
            for r in results if r.qualified
        ]
        return cls(as_of=as_of, setups=setups, note=note)

    @property
    def tickers(self) -> set[str]:
        return {s.ticker for s in self.setups}


class SnapshotStore:
    """One JSON file per scan date under ``root``."""

    def __init__(self, root: str | Path) -> None:
        self.root = Path(root)

    def save(self, snapshot: Snapshot) -> Path:
        self.root.mkdir(parents=True, exist_ok=True)
        path = self.root / f"{snapshot.as_of}.json"
        payload = {
            "as_of": snapshot.as_of,
            "note": snapshot.note,
            "setups": [asdict(s) for s in snapshot.setups],
        }
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
        return path

    def load_all(self) -> list[Snapshot]:
        snapshots: list[Snapshot] = []
        for path in sorted(self.root.glob("*.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            snapshots.append(Snapshot(
                as_of=data["as_of"],
                note=data.get("note", ""),
                setups=[Setup(**s) for s in data.get("setups", [])],
            ))
        return snapshots

    def first_flagged(self) -> dict[str, tuple[str, Setup]]:
        """Earliest ``as_of`` at which each ticker was flagged.

        Returns ``ticker -> (as_of, Setup)`` using the oldest snapshot that
        contains it, so a name that stays flagged for months is counted once
        from when it first appeared.
        """
        first: dict[str, tuple[str, Setup]] = {}
        for snap in sorted(self.load_all(), key=lambda s: s.as_of):
            for setup in snap.setups:
                if setup.ticker not in first:
                    first[setup.ticker] = (snap.as_of, setup)
        return first

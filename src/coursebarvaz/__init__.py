"""CourseBarvaz — early-positioning scanner for control-concentrated equities.

Focus: buying deep-discount, cash-rich companies *before* a corporate event
(parent buying out a listed subsidiary in Japan, or a promoter crossing the
SEBI 75% ceiling in India) — the highest risk/reward, lowest-complexity corner
of the event-driven landscape.
"""

from .models import Company, Metrics, Signal, ScanResult
from .engine import ScanEngine

__all__ = ["Company", "Metrics", "Signal", "ScanResult", "ScanEngine"]

__version__ = "0.1.0"

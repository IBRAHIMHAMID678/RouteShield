"""
Domain data schemas for weather risk assessment.

Pure framework-independent data structures using standard library dataclasses
and IntEnum. No Django or external library dependencies.
"""

from __future__ import annotations
from dataclasses import dataclass
from enum import IntEnum
from math import isfinite


class RiskLevel(IntEnum):
    """
    Ordered risk levels based on Spotter specification.
    
    Numeric values enable direct comparison (e.g. SEVERE > HIGH).
    """
    LOW = 1
    MODERATE = 2
    HIGH = 3
    SEVERE = 4
    NO_TRAVEL = 5

    @property
    def label(self) -> str:
        names = {
            1: "Low",
            2: "Moderate",
            3: "High",
            4: "Severe",
            5: "No Travel"
        }
        return names[self.value]

    @property
    def color(self) -> str:
        """Standard semantic color codes for UI mapping."""
        colors = {
            1: "#10b981",  # Emerald / Green
            2: "#f59e0b",  # Amber / Yellow
            3: "#f97316",  # Orange
            4: "#ef4444",  # Crimson / Red
            5: "#7f1d1d"   # Dark Burgundy / Maroon
        }
        return colors[self.value]


@dataclass(frozen=True, slots=True)
class WeatherObservation:
    """
    Normalized weather observation at a specific checkpoint and time.
    """
    wind_mph: float
    rain_in_per_hr: float
    snow_in_per_hr: float

    def __post_init__(self) -> None:
        for field, val in [
            ("wind_mph", self.wind_mph),
            ("rain_in_per_hr", self.rain_in_per_hr),
            ("snow_in_per_hr", self.snow_in_per_hr),
        ]:
            if not isfinite(val):
                raise ValueError(f"{field} must be a finite number, got {val}")
            if val < 0:
                raise ValueError(f"{field} cannot be negative, got {val}")


@dataclass(frozen=True, slots=True)
class RiskResult:
    """
    Final evaluated risk result for a checkpoint.
    """
    level: RiskLevel
    wind_level: RiskLevel
    rain_level: RiskLevel
    snow_level: RiskLevel
    score: float
    reasons: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not isinstance(self.level, RiskLevel):
            raise TypeError(f"level must be RiskLevel instance, got {type(self.level)}")
        if self.score != float(self.level.value):
            raise ValueError(f"score {self.score} must match level value {self.level.value}")

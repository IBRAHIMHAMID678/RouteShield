"""
Pure deterministic weather and load risk classification rules.

Thresholds are strictly defined from Spotter's Weather-Aware Truck Routing specification.
Lower bounds are inclusive; upper bounds are exclusive, matching standard interval notation.
"""

from __future__ import annotations
from math import isfinite
from .schemas import RiskLevel


def _validate_numeric(val: float, name: str) -> None:
    if not isfinite(val):
        raise ValueError(f"{name} must be a finite number, got {val}")
    if val < 0:
        raise ValueError(f"{name} cannot be negative, got {val}")


def classify_wind(wind_mph: float) -> tuple[RiskLevel, str]:
    """
    Classify wind speed in miles per hour:
    - Low: < 25 mph
    - Moderate: 25 - 34.99 mph
    - High: 35 - 44.99 mph
    - Severe: 45 - 54.99 mph
    - No Travel: >= 55 mph
    """
    _validate_numeric(wind_mph, "wind_mph")
    if wind_mph < 25.0:
        return RiskLevel.LOW, f"Wind {wind_mph:.1f} mph is Low (<25 mph)"
    if wind_mph < 35.0:
        return RiskLevel.MODERATE, f"Wind {wind_mph:.1f} mph is Moderate (25-34 mph)"
    if wind_mph < 45.0:
        return RiskLevel.HIGH, f"Wind {wind_mph:.1f} mph is High (35-44 mph)"
    if wind_mph < 55.0:
        return RiskLevel.SEVERE, f"Wind {wind_mph:.1f} mph is Severe (45-54 mph)"
    return RiskLevel.NO_TRAVEL, f"Wind {wind_mph:.1f} mph exceeds safe threshold (>=55 mph)"


def classify_rain(rain_in_per_hr: float) -> tuple[RiskLevel, str]:
    """
    Classify rain rate in inches per hour:
    - Low: < 0.10 in/hr
    - Moderate: 0.10 - 0.249 in/hr
    - High: 0.25 - 0.499 in/hr
    - Severe: 0.50 - 1.00 in/hr
    - No Travel: > 1.00 in/hr
    """
    _validate_numeric(rain_in_per_hr, "rain_in_per_hr")
    if rain_in_per_hr < 0.10:
        return RiskLevel.LOW, f"Rain {rain_in_per_hr:.2f} in/hr is Low (<0.10 in/hr)"
    if rain_in_per_hr < 0.25:
        return RiskLevel.MODERATE, f"Rain {rain_in_per_hr:.2f} in/hr is Moderate (0.10-0.25 in/hr)"
    if rain_in_per_hr < 0.50:
        return RiskLevel.HIGH, f"Rain {rain_in_per_hr:.2f} in/hr is High (0.25-0.50 in/hr)"
    if rain_in_per_hr <= 1.00:
        return RiskLevel.SEVERE, f"Rain {rain_in_per_hr:.2f} in/hr is Severe (0.50-1.00 in/hr)"
    return RiskLevel.NO_TRAVEL, f"Rain {rain_in_per_hr:.2f} in/hr exceeds safe limit (>1.00 in/hr)"


def classify_snow(snow_in_per_hr: float) -> tuple[RiskLevel, str]:
    """
    Classify snow rate in inches per hour:
    - Low: < 0.5 in/hr
    - Moderate: 0.5 - 0.99 in/hr
    - High: 1.0 - 1.99 in/hr
    - Severe: 2.0 - 3.0 in/hr
    - No Travel: > 3.0 in/hr
    """
    _validate_numeric(snow_in_per_hr, "snow_in_per_hr")
    if snow_in_per_hr < 0.5:
        return RiskLevel.LOW, f"Snow {snow_in_per_hr:.2f} in/hr is Low (<0.5 in/hr)"
    if snow_in_per_hr < 1.0:
        return RiskLevel.MODERATE, f"Snow {snow_in_per_hr:.2f} in/hr is Moderate (0.5-1.0 in/hr)"
    if snow_in_per_hr < 2.0:
        return RiskLevel.HIGH, f"Snow {snow_in_per_hr:.2f} in/hr is High (1.0-2.0 in/hr)"
    if snow_in_per_hr <= 3.0:
        return RiskLevel.SEVERE, f"Snow {snow_in_per_hr:.2f} in/hr is Severe (2.0-3.0 in/hr)"
    return RiskLevel.NO_TRAVEL, f"Snow {snow_in_per_hr:.2f} in/hr exceeds safe limit (>3.0 in/hr)"


def apply_load_rules(
    wind_level: RiskLevel,
    wind_mph: float,
    load_weight_lb: float
) -> tuple[RiskLevel, str | None]:
    """
    Apply load weight modifiers based on Spotter specification:
    - >= 55 mph -> No Travel for any load
    - 45 - 54 mph + > 30,000 lb -> No Travel (escalated from Severe)
    - 35 - 44 mph + > 40,000 lb -> Severe (escalated from High)
    """
    _validate_numeric(load_weight_lb, "load_weight_lb")

    if wind_mph >= 55.0:
        return RiskLevel.NO_TRAVEL, f"Load restriction: Wind {wind_mph:.1f} mph forbids travel for all load weights."

    if 45.0 <= wind_mph < 55.0 and load_weight_lb > 30000.0:
        return (
            RiskLevel.NO_TRAVEL,
            f"Load restriction escalated to No Travel: Wind {wind_mph:.1f} mph with heavy load ({load_weight_lb:,.0f} lb > 30,000 lb)."
        )

    if 35.0 <= wind_mph < 45.0 and load_weight_lb > 40000.0:
        return (
            RiskLevel.SEVERE,
            f"Load restriction escalated to Severe: Wind {wind_mph:.1f} mph with extreme load ({load_weight_lb:,.0f} lb > 40,000 lb)."
        )

    return wind_level, None

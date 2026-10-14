"""
Pure domain risk engine.

Evaluates combined weather conditions (wind, rain, snow) against load weight
to produce a deterministic, immutable RiskResult for each checkpoint.
Zero framework or database dependencies.
"""

from __future__ import annotations
from .schemas import RiskLevel, RiskResult, WeatherObservation
from .rules import (
    classify_wind,
    classify_rain,
    classify_snow,
    apply_load_rules,
    _validate_numeric,
)


def evaluate_checkpoint_risk(
    weather: WeatherObservation,
    load_weight_lb: float,
) -> RiskResult:
    """
    Evaluates weather risk for a single checkpoint given weather observation
    and vehicle load weight.
    """
    _validate_numeric(load_weight_lb, "load_weight_lb")

    base_wind_level, wind_reason = classify_wind(weather.wind_mph)
    rain_level, rain_reason = classify_rain(weather.rain_in_per_hr)
    snow_level, snow_reason = classify_snow(weather.snow_in_per_hr)

    # Apply load weight modifiers
    effective_wind_level, load_override_reason = apply_load_rules(
        base_wind_level, weather.wind_mph, load_weight_lb
    )

    # Highest severity among all conditions determines final risk
    final_level = max(effective_wind_level, rain_level, snow_level)

    reasons_list: list[str] = [wind_reason, rain_reason, snow_reason]
    if load_override_reason:
        reasons_list.append(load_override_reason)

    return RiskResult(
        level=final_level,
        wind_level=effective_wind_level,
        rain_level=rain_level,
        snow_level=snow_level,
        score=float(final_level.value),
        reasons=tuple(reasons_list),
    )

"""
Unit tests for evaluate_checkpoint_risk engine.
Verifies multi-variable weather aggregation, highest-severity precedence,
and load override integration.
"""

import pytest
from apps.api.risk.schemas import RiskLevel, WeatherObservation
from apps.api.risk.engine import evaluate_checkpoint_risk


class TestRiskEngine:
    def test_benign_weather_low_risk(self):
        obs = WeatherObservation(wind_mph=10.0, rain_in_per_hr=0.01, snow_in_per_hr=0.0)
        res = evaluate_checkpoint_risk(obs, load_weight_lb=25000.0)
        assert res.level == RiskLevel.LOW
        assert res.score == 1.0
        assert res.wind_level == RiskLevel.LOW
        assert res.rain_level == RiskLevel.LOW
        assert res.snow_level == RiskLevel.LOW

    def test_rain_dominates_when_highest(self):
        # Wind is Moderate (28 mph), Rain is High (0.35 in/hr), Snow is Low
        obs = WeatherObservation(wind_mph=28.0, rain_in_per_hr=0.35, snow_in_per_hr=0.0)
        res = evaluate_checkpoint_risk(obs, load_weight_lb=20000.0)
        assert res.level == RiskLevel.HIGH
        assert res.score == 3.0
        assert res.rain_level == RiskLevel.HIGH

    def test_snow_severe_dominates(self):
        obs = WeatherObservation(wind_mph=15.0, rain_in_per_hr=0.0, snow_in_per_hr=2.5)
        res = evaluate_checkpoint_risk(obs, load_weight_lb=15000.0)
        assert res.level == RiskLevel.SEVERE
        assert res.score == 4.0

    def test_load_weight_escalation_in_engine(self):
        # Wind 48 mph (Severe) + 35,000 lb load -> escalates to NO_TRAVEL
        obs = WeatherObservation(wind_mph=48.0, rain_in_per_hr=0.1, snow_in_per_hr=0.0)
        res = evaluate_checkpoint_risk(obs, load_weight_lb=35000.0)
        assert res.level == RiskLevel.NO_TRAVEL
        assert res.score == 5.0
        assert res.wind_level == RiskLevel.NO_TRAVEL
        assert any("escalated to No Travel" in r for r in res.reasons)

    def test_invalid_load_weight_rejected(self):
        obs = WeatherObservation(wind_mph=10.0, rain_in_per_hr=0.0, snow_in_per_hr=0.0)
        with pytest.raises(ValueError):
            evaluate_checkpoint_risk(obs, load_weight_lb=-500.0)
        with pytest.raises(ValueError):
            evaluate_checkpoint_risk(obs, load_weight_lb=float("nan"))

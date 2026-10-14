"""
Comprehensive unit tests for Spotter weather risk rules and load weight modifiers.
Tests all boundary conditions, thresholds, and invalid inputs.
"""

import pytest
from apps.api.risk.schemas import RiskLevel
from apps.api.risk.rules import (
    classify_wind,
    classify_rain,
    classify_snow,
    apply_load_rules,
)


class TestWindClassification:
    def test_low_wind(self):
        assert classify_wind(0.0)[0] == RiskLevel.LOW
        assert classify_wind(15.5)[0] == RiskLevel.LOW
        assert classify_wind(24.9)[0] == RiskLevel.LOW

    def test_moderate_wind(self):
        assert classify_wind(25.0)[0] == RiskLevel.MODERATE
        assert classify_wind(30.0)[0] == RiskLevel.MODERATE
        assert classify_wind(34.99)[0] == RiskLevel.MODERATE

    def test_high_wind(self):
        assert classify_wind(35.0)[0] == RiskLevel.HIGH
        assert classify_wind(40.0)[0] == RiskLevel.HIGH
        assert classify_wind(44.99)[0] == RiskLevel.HIGH

    def test_severe_wind(self):
        assert classify_wind(45.0)[0] == RiskLevel.SEVERE
        assert classify_wind(50.0)[0] == RiskLevel.SEVERE
        assert classify_wind(54.99)[0] == RiskLevel.SEVERE

    def test_no_travel_wind(self):
        assert classify_wind(55.0)[0] == RiskLevel.NO_TRAVEL
        assert classify_wind(75.0)[0] == RiskLevel.NO_TRAVEL

    def test_invalid_wind(self):
        with pytest.raises(ValueError):
            classify_wind(-1.0)
        with pytest.raises(ValueError):
            classify_wind(float("nan"))
        with pytest.raises(ValueError):
            classify_wind(float("inf"))


class TestRainClassification:
    def test_low_rain(self):
        assert classify_rain(0.0)[0] == RiskLevel.LOW
        assert classify_rain(0.05)[0] == RiskLevel.LOW
        assert classify_rain(0.099)[0] == RiskLevel.LOW

    def test_moderate_rain(self):
        assert classify_rain(0.10)[0] == RiskLevel.MODERATE
        assert classify_rain(0.18)[0] == RiskLevel.MODERATE
        assert classify_rain(0.249)[0] == RiskLevel.MODERATE

    def test_high_rain(self):
        assert classify_rain(0.25)[0] == RiskLevel.HIGH
        assert classify_rain(0.35)[0] == RiskLevel.HIGH
        assert classify_rain(0.499)[0] == RiskLevel.HIGH

    def test_severe_rain(self):
        assert classify_rain(0.50)[0] == RiskLevel.SEVERE
        assert classify_rain(0.75)[0] == RiskLevel.SEVERE
        assert classify_rain(1.00)[0] == RiskLevel.SEVERE

    def test_no_travel_rain(self):
        assert classify_rain(1.01)[0] == RiskLevel.NO_TRAVEL
        assert classify_rain(2.50)[0] == RiskLevel.NO_TRAVEL

    def test_invalid_rain(self):
        with pytest.raises(ValueError):
            classify_rain(-0.1)


class TestSnowClassification:
    def test_low_snow(self):
        assert classify_snow(0.0)[0] == RiskLevel.LOW
        assert classify_snow(0.49)[0] == RiskLevel.LOW

    def test_moderate_snow(self):
        assert classify_snow(0.5)[0] == RiskLevel.MODERATE
        assert classify_snow(0.99)[0] == RiskLevel.MODERATE

    def test_high_snow(self):
        assert classify_snow(1.0)[0] == RiskLevel.HIGH
        assert classify_snow(1.99)[0] == RiskLevel.HIGH

    def test_severe_snow(self):
        assert classify_snow(2.0)[0] == RiskLevel.SEVERE
        assert classify_snow(3.0)[0] == RiskLevel.SEVERE

    def test_no_travel_snow(self):
        assert classify_snow(3.01)[0] == RiskLevel.NO_TRAVEL
        assert classify_snow(6.0)[0] == RiskLevel.NO_TRAVEL

    def test_invalid_snow(self):
        with pytest.raises(ValueError):
            classify_snow(-0.5)


class TestLoadWeightRules:
    def test_wind_over_55_always_no_travel_regardless_of_load(self):
        # >= 55 mph -> No Travel for any load
        assert apply_load_rules(RiskLevel.NO_TRAVEL, 55.0, 5000.0)[0] == RiskLevel.NO_TRAVEL
        assert apply_load_rules(RiskLevel.NO_TRAVEL, 55.0, 45000.0)[0] == RiskLevel.NO_TRAVEL

    def test_wind_45_to_54_with_heavy_load_escalates_to_no_travel(self):
        # 45–54 mph + >30,000 lb -> No Travel
        # At exactly 30,000 lb -> stays SEVERE
        level, reason = apply_load_rules(RiskLevel.SEVERE, 50.0, 30000.0)
        assert level == RiskLevel.SEVERE
        assert reason is None

        # At 30,001 lb -> escalates to NO_TRAVEL
        level, reason = apply_load_rules(RiskLevel.SEVERE, 50.0, 30001.0)
        assert level == RiskLevel.NO_TRAVEL
        assert reason is not None
        assert "No Travel" in reason

    def test_wind_35_to_44_with_very_heavy_load_escalates_to_severe(self):
        # 35–44 mph + >40,000 lb -> Severe
        # At exactly 40,000 lb -> stays HIGH
        level, reason = apply_load_rules(RiskLevel.HIGH, 40.0, 40000.0)
        assert level == RiskLevel.HIGH
        assert reason is None

        # At 40,001 lb -> escalates to SEVERE
        level, reason = apply_load_rules(RiskLevel.HIGH, 40.0, 40001.0)
        assert level == RiskLevel.SEVERE
        assert reason is not None
        assert "Severe" in reason

    def test_light_wind_not_escalated(self):
        level, reason = apply_load_rules(RiskLevel.LOW, 20.0, 50000.0)
        assert level == RiskLevel.LOW
        assert reason is None

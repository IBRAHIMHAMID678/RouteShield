"""
Tests for RoutePlannerService orchestration.
Verifies complete flow: 3 routes produced, checkpoints evaluated,
weather attributed, recommendation selected.
"""

from datetime import datetime, timezone
import pytest
from apps.api.providers.mock_providers import MockRoutingProvider, MockWeatherProvider
from apps.api.services.planner_service import RoutePlannerService


class TestRoutePlannerService:
    @pytest.fixture
    def planner(self):
        return RoutePlannerService(
            routing_provider=MockRoutingProvider(),
            weather_provider=MockWeatherProvider(),
        )

    def test_plan_routes_produces_3_ranked_alternatives(self, planner):
        dep_time = datetime(2026, 10, 16, 9, 0, tzinfo=timezone.utc)
        # Chicago (41.8781, -87.6298) to Detroit (42.3314, -83.0458)
        routes = planner.plan_routes(
            origin_lat=41.8781,
            origin_lon=-87.6298,
            dest_lat=42.3314,
            dest_lon=-83.0458,
            departure_time=dep_time,
            load_weight_lb=32000.0,
            interval_miles=25.0,
        )

        assert len(routes) == 3
        # Ensure exactly one route is recommended
        recommended_count = sum(1 for r in routes if r.is_recommended)
        assert recommended_count == 1
        # Highest ranked route is rank 1
        assert routes[0].recommendation_rank == 1
        assert routes[0].is_recommended is True

        # Checkpoints exist and have weather and risk
        for r in routes:
            assert len(r.checkpoints) >= 2
            assert r.total_distance_miles > 0
            assert r.total_duration_hours > 0
            assert len(r.risk_segments) > 0
            for chk in r.checkpoints:
                assert chk.weather_available is True
                assert chk.risk is not None
                assert chk.weather is not None

    def test_sampling_intervals_10_and_50(self, planner):
        dep_time = datetime.now(timezone.utc)
        # 10 miles should generate more checkpoints than 50 miles
        routes_10 = planner.plan_routes(
            origin_lat=40.0, origin_lon=-80.0,
            dest_lat=40.0, dest_lon=-75.0,
            departure_time=dep_time,
            load_weight_lb=25000.0,
            interval_miles=10.0,
        )
        routes_50 = planner.plan_routes(
            origin_lat=40.0, origin_lon=-80.0,
            dest_lat=40.0, dest_lon=-75.0,
            departure_time=dep_time,
            load_weight_lb=25000.0,
            interval_miles=50.0,
        )

        assert len(routes_10[0].checkpoints) > len(routes_50[0].checkpoints)

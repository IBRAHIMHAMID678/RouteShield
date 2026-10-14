"""
Unit tests for 4-tier route ranking and recommendation hierarchy.
"""

from datetime import datetime, timezone
import pytest
from apps.api.routing.models import RouteOption
from apps.api.routing.ranking import rank_and_recommend_routes, ranking_sort_key


def _create_dummy_route(
    route_id: str,
    severe_miles: float,
    high_miles: float,
    average_risk_score: float,
    duration_hours: float,
    no_travel_miles: float = 0.0,
    is_eligible: bool = True,
) -> RouteOption:
    return RouteOption(
        route_id=route_id,
        route_name=f"Route {route_id}",
        summary_description="Test route",
        total_distance_miles=200.0,
        total_duration_hours=duration_hours,
        departure_time=datetime.now(timezone.utc),
        arrival_time=datetime.now(timezone.utc),
        geometry_geojson={"type": "LineString", "coordinates": []},
        checkpoints=(),
        risk_segments=(),
        severe_miles=severe_miles,
        high_miles=high_miles,
        moderate_miles=0.0,
        low_miles=200.0 - severe_miles - high_miles - no_travel_miles,
        no_travel_miles=no_travel_miles,
        average_risk_score=average_risk_score,
        is_eligible=is_eligible and (no_travel_miles == 0.0),
    )


class TestRouteRanking:
    def test_preference_1_fewest_severe_miles_wins(self):
        # Route 1: 5 severe miles, 4.0h duration
        # Route 2: 0 severe miles, 5.0h duration
        r1 = _create_dummy_route("R1", severe_miles=5.0, high_miles=0.0, average_risk_score=2.0, duration_hours=4.0)
        r2 = _create_dummy_route("R2", severe_miles=0.0, high_miles=10.0, average_risk_score=2.5, duration_hours=5.0)

        ranked = rank_and_recommend_routes([r1, r2])
        assert ranked[0].route_id == "R2"
        assert ranked[0].is_recommended is True
        assert ranked[1].route_id == "R1"
        assert ranked[1].is_recommended is False

    def test_preference_2_fewest_high_miles_breaks_tie(self):
        # Severe miles are equal (0)
        # R1: 15 high miles
        # R2: 5 high miles
        r1 = _create_dummy_route("R1", severe_miles=0.0, high_miles=15.0, average_risk_score=2.2, duration_hours=4.0)
        r2 = _create_dummy_route("R2", severe_miles=0.0, high_miles=5.0, average_risk_score=2.2, duration_hours=4.5)

        ranked = rank_and_recommend_routes([r1, r2])
        assert ranked[0].route_id == "R2"
        assert ranked[0].is_recommended is True

    def test_preference_3_lowest_average_risk_breaks_tie(self):
        # Severe (0) and High (10) are equal
        # R1: avg risk 2.1
        # R2: avg risk 1.8
        r1 = _create_dummy_route("R1", severe_miles=0.0, high_miles=10.0, average_risk_score=2.1, duration_hours=4.0)
        r2 = _create_dummy_route("R2", severe_miles=0.0, high_miles=10.0, average_risk_score=1.8, duration_hours=4.2)

        ranked = rank_and_recommend_routes([r1, r2])
        assert ranked[0].route_id == "R2"

    def test_preference_4_shortest_travel_time_final_tiebreaker(self):
        # All risk metrics identical
        # R1: 4.2 hours
        # R2: 4.8 hours
        r1 = _create_dummy_route("R1", severe_miles=0.0, high_miles=10.0, average_risk_score=2.0, duration_hours=4.2)
        r2 = _create_dummy_route("R2", severe_miles=0.0, high_miles=10.0, average_risk_score=2.0, duration_hours=4.8)

        ranked = rank_and_recommend_routes([r1, r2])
        assert ranked[0].route_id == "R1"

    def test_ineligible_route_with_no_travel_is_penalized(self):
        # R1 has No Travel miles
        # R2 has Severe miles but is legal/eligible
        r1 = _create_dummy_route("R1", severe_miles=0.0, high_miles=0.0, average_risk_score=1.5, duration_hours=3.5, no_travel_miles=10.0)
        r2 = _create_dummy_route("R2", severe_miles=20.0, high_miles=10.0, average_risk_score=3.0, duration_hours=5.0)

        ranked = rank_and_recommend_routes([r1, r2])
        assert ranked[0].route_id == "R2"
        assert ranked[0].is_recommended is True
        assert ranked[1].route_id == "R1"
        assert ranked[1].is_eligible is False
        assert ranked[1].is_recommended is False

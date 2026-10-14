"""
Unit tests for route checkpoint sampling and ETA calculation.
"""

from datetime import datetime, timezone
import pytest
from apps.api.routing.sampling import sample_route_checkpoints, haversine_miles


class TestHaversine:
    def test_known_distance(self):
        # New York (40.7128, -74.0060) to Philadelphia (39.9526, -75.1652) is ~80-85 statute miles
        dist = haversine_miles(40.7128, -74.0060, 39.9526, -75.1652)
        assert 80.0 < dist < 85.0

    def test_same_point_zero_distance(self):
        assert haversine_miles(35.0, -90.0, 35.0, -90.0) == 0.0


class TestRouteSampling:
    @pytest.fixture
    def linear_coords(self):
        # Simple coordinate list from West to East along latitude 40.0
        return [
            (-80.0, 40.0),
            (-79.0, 40.0),
            (-78.0, 40.0),
            (-77.0, 40.0),
        ]

    def test_checkpoint_spacing_25_miles(self, linear_coords):
        dep_time = datetime(2026, 10, 15, 8, 0, tzinfo=timezone.utc)
        total_dist = 100.0  # miles
        total_dur = 2.0     # hours

        checkpoints = sample_route_checkpoints(
            linear_coords,
            total_distance_miles=total_dist,
            total_duration_hours=total_dur,
            departure_time=dep_time,
            interval_miles=25.0,
        )

        assert len(checkpoints) >= 4
        # First checkpoint is at 0.0 miles
        assert checkpoints[0].distance_from_origin_miles == 0.0
        assert checkpoints[0].eta == dep_time

        # Last checkpoint is at destination
        assert checkpoints[-1].distance_from_origin_miles == total_dist
        assert checkpoints[-1].eta == datetime(2026, 10, 15, 10, 0, tzinfo=timezone.utc)

        # Distances are strictly increasing
        dists = [c.distance_from_origin_miles for c in checkpoints]
        assert dists == sorted(dists)

    def test_interval_validation(self, linear_coords):
        dep_time = datetime.now(timezone.utc)
        with pytest.raises(ValueError, match="Interval must be 10, 25, or 50"):
            sample_route_checkpoints(
                linear_coords,
                total_distance_miles=50.0,
                total_duration_hours=1.0,
                departure_time=dep_time,
                interval_miles=30.0,
            )

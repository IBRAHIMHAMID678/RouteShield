"""
Accurate checkpoint sampling along route geometry at 10, 25, or 50 mile intervals.
Calculates cumulative distances, segment lengths, and time-interpolated ETAs.
"""

from __future__ import annotations
import math
from datetime import datetime, timedelta
from typing import Sequence
from .models import Coordinate, RouteCheckpoint


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points in statute miles."""
    r_earth_miles = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r_earth_miles * c


def sample_route_checkpoints(
    coordinates: Sequence[tuple[float, float]],  # list of (lon, lat)
    total_distance_miles: float,
    total_duration_hours: float,
    departure_time: datetime,
    interval_miles: float = 25.0,
) -> list[RouteCheckpoint]:
    """
    Samples checkpoints at exact interval_miles along the route coordinate polyline.
    Origin and destination are always included.
    """
    if interval_miles not in (10.0, 25.0, 50.0):
        raise ValueError(f"Interval must be 10, 25, or 50 miles, got {interval_miles}")

    if len(coordinates) < 2:
        raise ValueError("At least 2 coordinates required to sample a route.")

    # Calculate cumulative distance along polyline vertices
    cum_distances: list[float] = [0.0]
    for i in range(1, len(coordinates)):
        lon_prev, lat_prev = coordinates[i - 1]
        lon_curr, lat_curr = coordinates[i]
        d = haversine_miles(lat_prev, lon_prev, lat_curr, lon_curr)
        cum_distances.append(cum_distances[-1] + d)

    raw_total_dist = cum_distances[-1]
    # Scaling factor to match the official routing engine's total distance if provided
    dist_scale = (total_distance_miles / raw_total_dist) if raw_total_dist > 0 else 1.0

    scaled_cum_distances = [d * dist_scale for d in cum_distances]
    target_total_dist = scaled_cum_distances[-1]

    # Target distances: 0, interval, 2*interval, ..., target_total_dist
    target_mile_points: list[float] = [0.0]
    curr_target = interval_miles
    while curr_target < target_total_dist - 0.5:  # avoid duplicate point right before destination
        target_mile_points.append(curr_target)
        curr_target += interval_miles
    if target_mile_points[-1] < target_total_dist:
        target_mile_points.append(target_total_dist)

    checkpoints: list[RouteCheckpoint] = []
    coord_idx = 0

    for idx, target_dist in enumerate(target_mile_points):
        # Find segment containing target_dist
        while (
            coord_idx < len(scaled_cum_distances) - 1
            and scaled_cum_distances[coord_idx + 1] < target_dist
        ):
            coord_idx += 1

        if coord_idx >= len(scaled_cum_distances) - 1:
            lon, lat = coordinates[-1]
        else:
            d_start = scaled_cum_distances[coord_idx]
            d_end = scaled_cum_distances[coord_idx + 1]
            seg_len = d_end - d_start
            ratio = (target_dist - d_start) / seg_len if seg_len > 0 else 0.0
            lon1, lat1 = coordinates[coord_idx]
            lon2, lat2 = coordinates[coord_idx + 1]
            lon = lon1 + ratio * (lon2 - lon1)
            lat = lat1 + ratio * (lat2 - lat1)

        # ETA interpolation based on distance ratio
        fraction_of_journey = target_dist / target_total_dist if target_total_dist > 0 else 0.0
        elapsed_seconds = fraction_of_journey * (total_duration_hours * 3600.0)
        eta = departure_time + timedelta(seconds=elapsed_seconds)

        # Segment miles ending at this checkpoint
        prev_dist = target_mile_points[idx - 1] if idx > 0 else 0.0
        segment_miles = target_dist - prev_dist

        checkpoints.append(
            RouteCheckpoint(
                checkpoint_id=f"chk_{idx:03d}",
                latitude=round(lat, 5),
                longitude=round(lon, 5),
                distance_from_origin_miles=round(target_dist, 2),
                segment_miles=round(segment_miles, 2),
                eta=eta,
                weather=None,
                risk=None,
                weather_available=False,
            )
        )

    return checkpoints

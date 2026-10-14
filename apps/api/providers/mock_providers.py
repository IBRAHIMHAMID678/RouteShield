"""
Deterministic mock providers for offline development and lightning-fast unit/integration tests.
"""

from __future__ import annotations
from datetime import datetime, timezone
import math
from typing import Sequence
from apps.api.risk.schemas import WeatherObservation
from .protocols import RawRouteGeometry


class MockRoutingProvider:
    """Returns 3 deterministic routes for any origin/destination pair."""

    def get_alternative_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
    ) -> list[RawRouteGeometry]:
        from apps.api.routing.sampling import haversine_miles
        base_dist = max(50.0, haversine_miles(origin_lat, origin_lon, dest_lat, dest_lon) * 1.2)
        base_dur = base_dist / 60.0

        def make_path(curvature: float, steps: int = 25):
            pts = []
            dx = dest_lon - origin_lon
            dy = dest_lat - origin_lat
            for i in range(steps + 1):
                t = i / steps
                bx = origin_lon + t * dx
                by = origin_lat + t * dy
                offset = math.sin(t * math.pi) * curvature * 0.5
                pts.append((round(bx - offset * dy * 0.1, 5), round(by + offset * dx * 0.1, 5)))
            return pts

        return [
            RawRouteGeometry(
                route_name="Route 1 (I-80 Direct)",
                coordinates=make_path(0.0),
                distance_miles=round(base_dist, 1),
                duration_hours=round(base_dur, 2),
                summary="Primary Interstate Highway",
            ),
            RawRouteGeometry(
                route_name="Route 2 (Northern Cut)",
                coordinates=make_path(0.4),
                distance_miles=round(base_dist * 1.06, 1),
                duration_hours=round(base_dur * 1.08, 2),
                summary="Northern Regional Highway",
            ),
            RawRouteGeometry(
                route_name="Route 3 (Southern Bypass)",
                coordinates=make_path(-0.4),
                distance_miles=round(base_dist * 1.12, 1),
                duration_hours=round(base_dur * 1.15, 2),
                summary="Southern Valley Bypass",
            ),
        ]


class MockWeatherProvider:
    """Returns deterministic weather observations based on coordinates and time."""

    def get_weather_at_checkpoints(
        self,
        queries: Sequence[tuple[str, float, float, datetime]],
    ) -> dict[str, WeatherObservation | None]:
        results: dict[str, WeatherObservation | None] = {}
        for chk_id, lat, lon, eta in queries:
            # Deterministic hash-based weather for reproducible tests
            seed = int(abs(lat * 100 + lon * 10 + eta.hour)) % 100
            
            # Predictable distribution
            if seed < 50:
                # Mild conditions
                results[chk_id] = WeatherObservation(wind_mph=15.0, rain_in_per_hr=0.02, snow_in_per_hr=0.0)
            elif seed < 75:
                # Moderate conditions
                results[chk_id] = WeatherObservation(wind_mph=28.0, rain_in_per_hr=0.15, snow_in_per_hr=0.0)
            elif seed < 90:
                # High wind conditions
                results[chk_id] = WeatherObservation(wind_mph=38.0, rain_in_per_hr=0.30, snow_in_per_hr=0.5)
            else:
                # Severe storm
                results[chk_id] = WeatherObservation(wind_mph=48.0, rain_in_per_hr=0.60, snow_in_per_hr=1.5)

        return results

    def get_corridor_weather_grid(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float,
        departure_time: datetime,
        offset_hours: int,
    ) -> list[dict]:
        from apps.api.providers.openmeteo_provider import OpenMeteoWeatherProvider
        # Re-use OpenMeteo grid generation logic for synthetic front progression
        p = OpenMeteoWeatherProvider()
        return p.get_corridor_weather_grid(min_lat, min_lon, max_lat, max_lon, departure_time, offset_hours)

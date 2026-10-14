"""
Provider protocols (interfaces) for routing, geocoding, and weather forecasting.
Decouples external third-party APIs from application domain logic.
"""

from __future__ import annotations
from typing import Protocol, Sequence
from datetime import datetime
from apps.api.risk.schemas import WeatherObservation


class GeocodingResult:
    def __init__(self, name: str, latitude: float, longitude: float):
        self.name = name
        self.latitude = latitude
        self.longitude = longitude


class RawRouteGeometry:
    def __init__(
        self,
        route_name: str,
        coordinates: list[tuple[float, float]],  # [lon, lat] pairs
        distance_miles: float,
        duration_hours: float,
        summary: str = "",
    ):
        self.route_name = route_name
        self.coordinates = coordinates
        self.distance_miles = distance_miles
        self.duration_hours = duration_hours
        self.summary = summary


class RoutingProvider(Protocol):
    """Protocol for fetching alternative routes between origin and destination."""

    def get_alternative_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
    ) -> list[RawRouteGeometry]:
        ...


class WeatherProvider(Protocol):
    """Protocol for fetching hourly weather forecasts at specific coordinates and timestamps."""

    def get_weather_at_checkpoints(
        self,
        queries: Sequence[tuple[str, float, float, datetime]],  # (id, lat, lon, eta)
    ) -> dict[str, WeatherObservation | None]:
        ...

    def get_corridor_weather_grid(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float,
        departure_time: datetime,
        offset_hours: int,
    ) -> list[dict]:
        ...

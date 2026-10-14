"""
Framework-independent domain models for routing, checkpoints, and route assessment.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from math import isfinite
from typing import Any
from apps.api.risk.schemas import RiskResult, WeatherObservation


@dataclass(frozen=True, slots=True)
class Coordinate:
    latitude: float
    longitude: float

    def __post_init__(self) -> None:
        if not (-90.0 <= self.latitude <= 90.0):
            raise ValueError(f"Latitude out of range [-90, 90]: {self.latitude}")
        if not (-180.0 <= self.longitude <= 180.0):
            raise ValueError(f"Longitude out of range [-180, 180]: {self.longitude}")


@dataclass(frozen=True, slots=True)
class RouteCheckpoint:
    """
    Checkpoint along a route segment.
    Risk at this checkpoint applies to the segment ending at this checkpoint.
    """
    checkpoint_id: str
    latitude: float
    longitude: float
    distance_from_origin_miles: float
    segment_miles: float
    eta: datetime
    weather: WeatherObservation | None = None
    risk: RiskResult | None = None
    weather_available: bool = False

    def __post_init__(self) -> None:
        if not isfinite(self.distance_from_origin_miles) or self.distance_from_origin_miles < 0:
            raise ValueError(f"Invalid distance_from_origin_miles: {self.distance_from_origin_miles}")
        if not isfinite(self.segment_miles) or self.segment_miles < 0:
            raise ValueError(f"Invalid segment_miles: {self.segment_miles}")


@dataclass(frozen=True, slots=True)
class RouteSegmentRisk:
    """
    Geometry segment with attributed risk for colored map line rendering.
    """
    segment_id: str
    start_point: tuple[float, float]  # [lon, lat]
    end_point: tuple[float, float]    # [lon, lat]
    distance_miles: float
    risk_level_value: int
    risk_label: str
    risk_color: str


@dataclass(frozen=True, slots=True)
class RouteOption:
    """
    Complete evaluated route option with summarized metrics and ranking.
    """
    route_id: str
    route_name: str
    summary_description: str
    total_distance_miles: float
    total_duration_hours: float
    departure_time: datetime
    arrival_time: datetime
    geometry_geojson: dict[str, Any]
    checkpoints: tuple[RouteCheckpoint, ...]
    risk_segments: tuple[RouteSegmentRisk, ...]
    
    # Aggregated metrics for recommendation
    severe_miles: float
    high_miles: float
    moderate_miles: float
    low_miles: float
    no_travel_miles: float
    average_risk_score: float
    is_eligible: bool
    is_recommended: bool = False
    recommendation_rank: int = 1
    recommendation_reasons: tuple[str, ...] = ()

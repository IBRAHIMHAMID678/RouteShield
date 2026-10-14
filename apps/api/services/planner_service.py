"""
Route planner orchestration service.
Coordinates routing, checkpoint sampling, temporal weather querying,
risk calculation, segment risk attribution, and 4-tier route recommendation.
"""

from __future__ import annotations
from dataclasses import replace
from datetime import datetime, timezone
from typing import Any

from apps.api.risk.engine import evaluate_checkpoint_risk
from apps.api.risk.schemas import RiskLevel
from apps.api.routing.models import (
    RouteCheckpoint,
    RouteOption,
    RouteSegmentRisk,
)
from apps.api.routing.ranking import rank_and_recommend_routes
from apps.api.routing.sampling import sample_route_checkpoints
from apps.api.providers.factory import get_routing_provider, get_weather_provider
from apps.api.providers.protocols import RoutingProvider, WeatherProvider


class RoutePlannerService:
    def __init__(
        self,
        routing_provider: RoutingProvider | None = None,
        weather_provider: WeatherProvider | None = None,
    ):
        self.routing_provider = routing_provider or get_routing_provider()
        self.weather_provider = weather_provider or get_weather_provider()

    def plan_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        departure_time: datetime,
        load_weight_lb: float,
        interval_miles: float = 25.0,
    ) -> list[RouteOption]:
        """
        End-to-end route evaluation and recommendation.
        Guarantees 3 routes with checkpoints, risk assessments, and recommendation.
        """
        # 1. Fetch 3 alternative routes
        raw_routes = self.routing_provider.get_alternative_routes(
            origin_lat, origin_lon, dest_lat, dest_lon
        )
        if not raw_routes:
            raise RuntimeError("Failed to obtain route geometry from routing provider.")

        evaluated_routes: list[RouteOption] = []

        for idx, raw in enumerate(raw_routes):
            route_id = f"route_{idx + 1}"
            
            # 2. Sample checkpoints along geometry
            checkpoints = sample_route_checkpoints(
                coordinates=raw.coordinates,
                total_distance_miles=raw.distance_miles,
                total_duration_hours=raw.duration_hours,
                departure_time=departure_time,
                interval_miles=interval_miles,
            )

            # 3. Batch query weather for each checkpoint at its estimated arrival time
            queries = [
                (chk.checkpoint_id, chk.latitude, chk.longitude, chk.eta)
                for chk in checkpoints
            ]
            weather_map = self.weather_provider.get_weather_at_checkpoints(queries)

            # 4. Evaluate risk at each checkpoint
            evaluated_checkpoints: list[RouteCheckpoint] = []
            severe_miles = 0.0
            high_miles = 0.0
            moderate_miles = 0.0
            low_miles = 0.0
            no_travel_miles = 0.0
            weighted_score_sum = 0.0
            total_evaluated_miles = 0.0
            has_missing_weather = False

            for chk in checkpoints:
                weather_obs = weather_map.get(chk.checkpoint_id)
                if weather_obs is not None:
                    risk_res = evaluate_checkpoint_risk(weather_obs, load_weight_lb)
                    evaluated_chk = replace(
                        chk,
                        weather=weather_obs,
                        risk=risk_res,
                        weather_available=True,
                    )
                    # Accumulate mileage metrics based on checkpoint's segment
                    seg_dist = chk.segment_miles
                    total_evaluated_miles += seg_dist
                    weighted_score_sum += risk_res.score * seg_dist

                    if risk_res.level == RiskLevel.NO_TRAVEL:
                        no_travel_miles += seg_dist
                    elif risk_res.level == RiskLevel.SEVERE:
                        severe_miles += seg_dist
                    elif risk_res.level == RiskLevel.HIGH:
                        high_miles += seg_dist
                    elif risk_res.level == RiskLevel.MODERATE:
                        moderate_miles += seg_dist
                    else:
                        low_miles += seg_dist
                else:
                    # Missing weather data is NEVER silently treated as safe
                    has_missing_weather = True
                    evaluated_chk = replace(
                        chk,
                        weather=None,
                        risk=None,
                        weather_available=False,
                    )

                evaluated_checkpoints.append(evaluated_chk)

            # Compute route-level average risk score
            if total_evaluated_miles > 0:
                avg_risk = weighted_score_sum / total_evaluated_miles
            else:
                avg_risk = 1.0

            # Eligibility: No-travel miles must be 0 and weather must not be missing
            is_eligible = (no_travel_miles == 0.0) and (not has_missing_weather)

            # 5. Build segment risk attribution for map line coloring
            risk_segments = self._build_risk_segments(
                raw.coordinates, evaluated_checkpoints
            )

            # Route arrival time is the ETA at the final checkpoint
            arrival_time = evaluated_checkpoints[-1].eta if evaluated_checkpoints else departure_time

            route_opt = RouteOption(
                route_id=route_id,
                route_name=raw.route_name,
                summary_description=raw.summary or f"{raw.distance_miles:.1f} miles, {raw.duration_hours:.1f} hours",
                total_distance_miles=raw.distance_miles,
                total_duration_hours=raw.duration_hours,
                departure_time=departure_time,
                arrival_time=arrival_time,
                geometry_geojson={
                    "type": "LineString",
                    "coordinates": [[c[0], c[1]] for c in raw.coordinates],
                },
                checkpoints=tuple(evaluated_checkpoints),
                risk_segments=tuple(risk_segments),
                severe_miles=round(severe_miles, 1),
                high_miles=round(high_miles, 1),
                moderate_miles=round(moderate_miles, 1),
                low_miles=round(low_miles, 1),
                no_travel_miles=round(no_travel_miles, 1),
                average_risk_score=round(avg_risk, 2),
                is_eligible=is_eligible,
            )
            evaluated_routes.append(route_opt)

        # 6. Apply 4-tier recommendation hierarchy
        ranked_routes = rank_and_recommend_routes(evaluated_routes)
        return ranked_routes

    def _build_risk_segments(
        self,
        polyline_coords: list[tuple[float, float]],
        checkpoints: list[RouteCheckpoint],
    ) -> list[RouteSegmentRisk]:
        """
        Maps checkpoint risk levels onto geometry line intervals for visual map rendering.
        """
        segments: list[RouteSegmentRisk] = []
        if len(checkpoints) < 2 or not polyline_coords:
            return segments

        # For each adjacent pair of checkpoints, attribute the risk of the ending checkpoint
        for i in range(1, len(checkpoints)):
            start_chk = checkpoints[i - 1]
            end_chk = checkpoints[i]

            risk_level = end_chk.risk.level if end_chk.risk else RiskLevel.LOW
            segments.append(
                RouteSegmentRisk(
                    segment_id=f"seg_{i}",
                    start_point=(start_chk.longitude, start_chk.latitude),
                    end_point=(end_chk.longitude, end_chk.latitude),
                    distance_miles=end_chk.segment_miles,
                    risk_level_value=risk_level.value,
                    risk_label=risk_level.label,
                    risk_color=risk_level.color,
                )
            )

        return segments

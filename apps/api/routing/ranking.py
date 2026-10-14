"""
Deterministic route ranking and recommendation logic.
Implements Spotter's 4-tier preference hierarchy:
1. Fewest Severe miles
2. Fewest High miles
3. Lowest average risk
4. Shortest travel times
"""

from __future__ import annotations
from dataclasses import replace
from .models import RouteOption


def ranking_sort_key(route: RouteOption) -> tuple[int, float, float, float, float]:
    """
    Computes deterministic ranking key for lexicographical sorting.
    Primary field is eligibility (0 for eligible, 1 for ineligible).
    Remaining fields follow Spotter preference hierarchy:
    - Fewest Severe miles
    - Fewest High miles
    - Lowest average risk
    - Shortest travel duration
    """
    ineligible_flag = 0 if route.is_eligible else 1
    return (
        ineligible_flag,
        route.severe_miles,
        route.high_miles,
        route.average_risk_score,
        route.total_duration_hours,
    )


def rank_and_recommend_routes(routes: list[RouteOption]) -> list[RouteOption]:
    """
    Ranks route options and tags the recommended winning route with detailed reasons.
    Rank #1 is always the recommended route (with caution warnings if hazardous).
    """
    if not routes:
        return []

    sorted_routes = sorted(routes, key=ranking_sort_key)
    ranked_results: list[RouteOption] = []

    for idx, r in enumerate(sorted_routes):
        rank = idx + 1
        is_recommended = (rank == 1)
        reasons: list[str] = []

        if not r.is_eligible:
            if r.no_travel_miles > 0:
                warning = f"Hazard Alert: Route contains {r.no_travel_miles:.1f} No-Travel miles."
            else:
                warning = "Warning: Route contains unverified weather segments."
            reasons.append(warning)
            if is_recommended:
                reasons.append("Selected as the least hazardous option, but travel is not recommended under current forecast.")
        else:
            if is_recommended:
                reasons.append(
                    f"Recommended Route: Safest and most efficient option with "
                    f"{r.severe_miles:.1f} severe miles, {r.high_miles:.1f} high miles, "
                    f"avg risk score {r.average_risk_score:.2f}, driving time {r.total_duration_hours:.1f}h."
                )
            else:
                reasons.append(
                    f"Rank #{rank}: Alternative route with {r.severe_miles:.1f} severe miles "
                    f"and {r.total_duration_hours:.1f}h travel time."
                )

        ranked_results.append(
            replace(
                r,
                is_recommended=is_recommended,
                recommendation_rank=rank,
                recommendation_reasons=tuple(reasons),
            )
        )

    return ranked_results

"""
REST API Views for Route Evaluation, Corridor Weather Grid, and Geocoding.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests

from apps.api.services.planner_service import RoutePlannerService
from apps.api.providers.factory import get_weather_provider
from .serializers import (
    RoutePlanRequestSerializer,
    RouteOptionSerializer,
    CorridorGridRequestSerializer,
)


class EvaluateRoutesView(APIView):
    """
    POST /api/v1/routes/evaluate
    Evaluates 3 alternative routes, samples weather at checkpoints,
    classifies risks with load modifiers, and ranks routes.
    """

    def post(self, request):
        serializer = RoutePlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated = serializer.validated_data
        planner = RoutePlannerService()

        try:
            routes = planner.plan_routes(
                origin_lat=validated["origin_lat"],
                origin_lon=validated["origin_lon"],
                dest_lat=validated["dest_lat"],
                dest_lon=validated["dest_lon"],
                departure_time=validated["departure_time"],
                load_weight_lb=validated["load_weight_lb"],
                interval_miles=validated["sampling_interval_miles"],
            )

            output_serializer = RouteOptionSerializer(routes, many=True)
            return Response(
                {
                    "success": True,
                    "count": len(routes),
                    "routes": output_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": "Failed to calculate routes", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CorridorGridViewView(APIView):
    """
    GET /api/v1/corridor/grid
    Returns spatial weather intensity grid along the route corridor for the 0-48h forecast slider.
    """

    def get(self, request):
        serializer = CorridorGridRequestSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid parameters", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        weather_provider = get_weather_provider()
        try:
            grid = weather_provider.get_corridor_weather_grid(
                min_lat=data["min_lat"],
                min_lon=data["min_lon"],
                max_lat=data["max_lat"],
                max_lon=data["max_lon"],
                departure_time=data["departure_time"],
                offset_hours=data["offset_hours"],
            )
            return Response({"success": True, "grid": grid}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to generate corridor grid", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GeocodeCityView(APIView):
    """
    GET /api/v1/geocode?q=Denver
    Free Open-Meteo geocoding to resolve city names to coordinates.
    """

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response({"results": []})

        try:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json"
            resp = requests.get(url, timeout=5.0)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                formatted = [
                    {
                        "name": f"{r.get('name')}, {r.get('admin1', '')} ({r.get('country_code', '')})",
                        "latitude": r.get("latitude"),
                        "longitude": r.get("longitude"),
                    }
                    for r in results
                ]
                return Response({"results": formatted})
        except Exception:
            pass

        return Response({"results": []})


class HealthCheckView(APIView):
    """
    GET /api/v1/health
    Operational liveness probe.
    """

    def get(self, request):
        return Response({"status": "healthy", "service": "weather-truck-routing-api"})

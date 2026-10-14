"""
Serializers for Route Planning API request and response validation.
"""

from rest_framework import serializers
from datetime import datetime, timezone


class RoutePlanRequestSerializer(serializers.Serializer):
    origin_lat = serializers.FloatField(min_value=-90.0, max_value=90.0)
    origin_lon = serializers.FloatField(min_value=-180.0, max_value=180.0)
    dest_lat = serializers.FloatField(min_value=-90.0, max_value=90.0)
    dest_lon = serializers.FloatField(min_value=-180.0, max_value=180.0)
    origin_name = serializers.CharField(max_length=200, required=False, default="Origin")
    dest_name = serializers.CharField(max_length=200, required=False, default="Destination")
    departure_time = serializers.DateTimeField()
    load_weight_lb = serializers.FloatField(min_value=1.0, max_value=150000.0)
    sampling_interval_miles = serializers.FloatField(default=25.0)

    def validate_sampling_interval_miles(self, value: float) -> float:
        val = float(value)
        if val not in (10.0, 25.0, 50.0):
            raise serializers.ValidationError("Sampling interval must be 10, 25, or 50 miles.")
        return val

    def validate_departure_time(self, value: datetime) -> datetime:
        # Ensure timezone-aware in UTC
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)


class WeatherObservationSerializer(serializers.Serializer):
    wind_mph = serializers.FloatField()
    rain_in_per_hr = serializers.FloatField()
    snow_in_per_hr = serializers.FloatField()


class RiskResultSerializer(serializers.Serializer):
    level = serializers.IntegerField(source="level.value")
    level_label = serializers.CharField(source="level.label")
    level_color = serializers.CharField(source="level.color")
    wind_level = serializers.IntegerField(source="wind_level.value")
    rain_level = serializers.IntegerField(source="rain_level.value")
    snow_level = serializers.IntegerField(source="snow_level.value")
    score = serializers.FloatField()
    reasons = serializers.ListField(child=serializers.CharField())


class CheckpointSerializer(serializers.Serializer):
    checkpoint_id = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    distance_from_origin_miles = serializers.FloatField()
    segment_miles = serializers.FloatField()
    eta = serializers.DateTimeField()
    weather = WeatherObservationSerializer(allow_null=True)
    risk = RiskResultSerializer(allow_null=True)
    weather_available = serializers.BooleanField()


class RouteSegmentRiskSerializer(serializers.Serializer):
    segment_id = serializers.CharField()
    start_point = serializers.ListField(child=serializers.FloatField())
    end_point = serializers.ListField(child=serializers.FloatField())
    distance_miles = serializers.FloatField()
    risk_level_value = serializers.IntegerField()
    risk_label = serializers.CharField()
    risk_color = serializers.CharField()


class RouteOptionSerializer(serializers.Serializer):
    route_id = serializers.CharField()
    route_name = serializers.CharField()
    summary_description = serializers.CharField()
    total_distance_miles = serializers.FloatField()
    total_duration_hours = serializers.FloatField()
    departure_time = serializers.DateTimeField()
    arrival_time = serializers.DateTimeField()
    geometry_geojson = serializers.DictField()
    checkpoints = CheckpointSerializer(many=True)
    risk_segments = RouteSegmentRiskSerializer(many=True)
    severe_miles = serializers.FloatField()
    high_miles = serializers.FloatField()
    moderate_miles = serializers.FloatField()
    low_miles = serializers.FloatField()
    no_travel_miles = serializers.FloatField()
    average_risk_score = serializers.FloatField()
    is_eligible = serializers.BooleanField()
    is_recommended = serializers.BooleanField()
    recommendation_rank = serializers.IntegerField()
    recommendation_reasons = serializers.ListField(child=serializers.CharField())


class CorridorGridRequestSerializer(serializers.Serializer):
    min_lat = serializers.FloatField()
    min_lon = serializers.FloatField()
    max_lat = serializers.FloatField()
    max_lon = serializers.FloatField()
    departure_time = serializers.DateTimeField()
    offset_hours = serializers.IntegerField(min_value=0, max_value=48, default=0)

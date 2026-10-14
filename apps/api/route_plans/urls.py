"""
URL routes for route_plans app.
"""

from django.urls import path
from .views import (
    EvaluateRoutesView,
    CorridorGridViewView,
    GeocodeCityView,
    HealthCheckView,
)

urlpatterns = [
    path("routes/evaluate", EvaluateRoutesView.as_view(), name="evaluate-routes"),
    path("corridor/grid", CorridorGridViewView.as_view(), name="corridor-grid"),
    path("geocode", GeocodeCityView.as_view(), name="geocode"),
    path("health", HealthCheckView.as_view(), name="health-check"),
]

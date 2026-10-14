"""
Integration tests for Django REST Framework views.
"""

from datetime import datetime, timezone
import pytest
from rest_framework.test import APIClient
from rest_framework import status


@pytest.mark.django_db
class TestRoutePlansAPI:
    @pytest.fixture
    def client(self):
        return APIClient()

    def test_health_check(self, client):
        resp = client.get("/api/v1/health")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json().get("status") == "healthy"

    def test_evaluate_routes_endpoint(self, client, monkeypatch):
        # Force mock providers for fast, deterministic integration test
        monkeypatch.setenv("ROUTING_PROVIDER", "mock")
        monkeypatch.setenv("WEATHER_PROVIDER", "mock")

        payload = {
            "origin_lat": 41.8781,
            "origin_lon": -87.6298,
            "dest_lat": 39.9526,
            "dest_lon": -75.1652,
            "departure_time": "2026-10-18T10:00:00Z",
            "load_weight_lb": 35000.0,
            "sampling_interval_miles": 25.0,
        }
        resp = client.post("/api/v1/routes/evaluate", data=payload, format="json")
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data.get("success") is True
        assert data.get("count") == 3
        routes = data.get("routes", [])
        assert len(routes) == 3

        # Exactly one route is marked recommended
        recommended = [r for r in routes if r.get("is_recommended")]
        assert len(recommended) == 1
        assert recommended[0]["recommendation_rank"] == 1

        # Checkpoints structure validated
        checkpoints = routes[0]["checkpoints"]
        assert len(checkpoints) >= 2
        first_chk = checkpoints[0]
        assert "distance_from_origin_miles" in first_chk
        assert "risk" in first_chk
        assert "weather" in first_chk

    def test_evaluate_routes_invalid_weight(self, client):
        payload = {
            "origin_lat": 40.0,
            "origin_lon": -80.0,
            "dest_lat": 40.0,
            "dest_lon": -75.0,
            "departure_time": "2026-10-18T10:00:00Z",
            "load_weight_lb": -50.0,  # Invalid negative
            "sampling_interval_miles": 25.0,
        }
        resp = client.post("/api/v1/routes/evaluate", data=payload, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "load_weight_lb" in resp.json().get("details", {})

    def test_corridor_grid_endpoint(self, client):
        params = {
            "min_lat": 39.0,
            "min_lon": -88.0,
            "max_lat": 42.0,
            "max_lon": -75.0,
            "departure_time": "2026-10-18T10:00:00Z",
            "offset_hours": 12,
        }
        resp = client.get("/api/v1/corridor/grid", data=params)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data.get("success") is True
        grid = data.get("grid", [])
        assert len(grid) > 0
        assert "intensity" in grid[0]
        assert grid[0]["offset_hours"] == 12

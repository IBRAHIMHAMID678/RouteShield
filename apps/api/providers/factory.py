"""
Factory module to instantiate the configured Routing and Weather providers.
"""

import os
from .protocols import RoutingProvider, WeatherProvider
from .osrm_provider import OSRMRoutingProvider
from .openmeteo_provider import OpenMeteoWeatherProvider
from .mock_providers import MockRoutingProvider, MockWeatherProvider


def get_routing_provider() -> RoutingProvider:
    provider_name = os.getenv("ROUTING_PROVIDER", "osrm").lower()
    if provider_name == "mock":
        return MockRoutingProvider()
    return OSRMRoutingProvider()


def get_weather_provider() -> WeatherProvider:
    provider_name = os.getenv("WEATHER_PROVIDER", "openmeteo").lower()
    if provider_name == "mock":
        return MockWeatherProvider()
    return OpenMeteoWeatherProvider()

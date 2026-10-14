# RouteShield — Weather-Aware Commercial Fleet Routing Platform

> Enterprise fleet decision-support system that evaluates highway route corridors, samples high-resolution meteorological forecasts at vehicle estimated arrival times (ETA), applies load-dependent aerodynamic and precipitation hazard models, and deterministically recommends the safest transit corridor using a multi-tier risk hierarchy.

[![Automated Test Suite](https://img.shields.io/badge/pytest-42%20passed-emerald?style=for-the-badge&logo=pytest)](pytest.ini)
[![Python](https://img.shields.io/badge/python-3.11+-blue?style=for-the-badge&logo=python)](requirements.txt)
[![Django](https://img.shields.io/badge/django-5.1-emerald?style=for-the-badge&logo=django)](apps/api)
[![React](https://img.shields.io/badge/react-18.3-cyan?style=for-the-badge&logo=react)](apps/web)
[![TypeScript](https://img.shields.io/badge/typescript-5.7-blue?style=for-the-badge&logo=typescript)](apps/web)
[![License](https://img.shields.io/badge/license-MIT-slate?style=for-the-badge)](LICENSE)

---

## 📋 Table of Contents
1. [Platform Overview](#-platform-overview)
2. [Architecture & System Design](#-architecture--system-design)
3. [Safety Models & Risk Classification](#-safety-models--risk-classification)
4. [Route Evaluation & Recommendation Hierarchy](#-route-evaluation--recommendation-hierarchy)
5. [REST API Specification](#-rest-api-specification)
6. [Key Engineering Decisions](#-key-engineering-decisions)
7. [Local Setup & Verification](#-local-setup--verification)
8. [Automated Test Suite (42 Tests)](#-automated-test-suite)

---

## 🚀 Platform Overview

Commercial freight operations face severe safety risks when heavy tractor-trailers encounter localized high-wind events, heavy rain, or freezing conditions. A crosswind of 45 mph might be manageable for an unladen flatbed, but poses a catastrophic rollover risk for a top-heavy 42,000 lb trailer.

**RouteShield** provides dispatchers and fleet safety managers with real-time, predictive hazard analysis:
1. **Multi-Corridor Generation**: Generates 3 alternative highway routes between origin and destination via OSRM highway routing.
2. **Equidistant Haversine Sampling**: Discretizes route geometries into precise checkpoints at configurable intervals (10, 25, or 50 miles), computing cumulative distance and time-interpolated estimated arrival times (ETA).
3. **Temporal Forecast Synchronization**: Queries hourly meteorological forecasts for each checkpoint at its exact arrival timestamp via Open-Meteo concurrent threads.
4. **Load-Dependent Risk Modeling**: Evaluates aerodynamic rollover vulnerability, hydroplaning risk, and snow accumulation based on gross vehicle weight.
5. **Deterministic 4-Tier Decision Hierarchy**: Ranks routes using an objective lexicographical preference order (Severe miles $\rightarrow$ High miles $\rightarrow$ Average risk $\rightarrow$ Duration).
6. **Geographic HUD & Timeline Scrubber**: Displays interactive colored risk polylines, checkpoint telemetry popups, and a 0–48 hour forecast corridor heatmap slider for proactive departure delay scheduling.

---

## 🏛️ Architecture & System Design

```
[ Client Layer: React 18 + TypeScript + Vite + Leaflet HUD + Lucide ]
                                   │
                                   ▼ REST API (/api/v1/)
[ Application Layer: Django 5 + Django REST Framework ]
  ├── route_plans/          ──> REST ViewSets & Serializer Validation
  ├── services/             ──> RoutePlannerService (Workflow Orchestration)
  │
  ▼ [ Pure Domain Core: 0 Framework Dependencies ]
  ├── risk/                 ──> Wind, Rain, Snow & Cargo Weight Escalation Rules
  ├── routing/              ──> Haversine Discretization, ETA Interpolation, 4-Tier Ranking
  │
  ▼ [ Infrastructure Adapters: Protocol Driven ]
  └── providers/            ──> RoutingProvider & WeatherProvider Implementations:
                                ├── Live: OSRM Highway Engine + Concurrent Open-Meteo API
                                └── Mock: Deterministic offline fixtures for CI/CD
```

### Architectural Principles:
* **Decoupled Domain Core**: All physics models, threshold categorizations, load modifiers, and ranking algorithms reside in pure Python modules (`apps/api/risk` and `apps/api/routing`). They use frozen dataclasses (`frozen=True, slots=True`) and `IntEnum`, maintaining 100% testability without databases or mock HTTP servers.
* **Fail-Safe Weather Semantics**: If an external weather provider experiences an outage or returns incomplete coordinate data, the system never silently defaults to "Low Risk". It explicitly flags `weather_available=False`, assigns an unverified status, and notifies dispatch.
* **Unified Single-Binary Distribution**: The production build packages the compiled React SPA directly into Django static assets served via WhiteNoise, eliminating CORS friction and proxy overhead.

---

## ⚖️ Safety Models & Risk Classification

### 1. Meteorological Threshold Matrix
Each route checkpoint evaluates wind, rain, and snow intensity independently against standardized commercial transport thresholds:

| Hazard Metric | Low (1) | Moderate (2) | High (3) | Severe (4) | No Travel (5) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sustained Wind / Gusts** | $<25\text{ mph}$ | $25\text{–}34\text{ mph}$ | $35\text{–}44\text{ mph}$ | $45\text{–}54\text{ mph}$ | $\ge 55\text{ mph}$ |
| **Precipitation (Rain)** | $<0.10\text{ in/hr}$ | $0.10\text{–}0.25\text{ in/hr}$ | $0.25\text{–}0.50\text{ in/hr}$ | $0.50\text{–}1.00\text{ in/hr}$ | $>1.00\text{ in/hr}$ |
| **Precipitation (Snow)** | $<0.5\text{ in/hr}$ | $0.5\text{–}1.0\text{ in/hr}$ | $1.0\text{–}2.0\text{ in/hr}$ | $2.0\text{–}3.0\text{ in/hr}$ | $>3.0\text{ in/hr}$ |

*Base checkpoint risk level is defined by the maximum hazard tier observed.*

### 2. Cargo Load Weight Escalation Rules
Gross vehicle weight substantially alters vehicle dynamics during severe wind events:
* **Universal Hard Stop**: Wind $\ge 55\text{ mph} \rightarrow$ **No Travel** for all vehicle configurations.
* **Heavy Cargo Escalation**: Wind $45\text{–}54\text{ mph}$ with load $>30,000\text{ lb} \rightarrow$ **No Travel** *(escalated from Severe due to high-profile rollover risk)*.
* **Extreme Mass Escalation**: Wind $35\text{–}44\text{ mph}$ with load $>40,000\text{ lb} \rightarrow$ **Severe** *(escalated from High)*.

---

## 🎯 Route Evaluation & Recommendation Hierarchy

Alternative transit corridors are evaluated and sorted using a strict 4-tier lexicographical preference order:

$$\text{Rank}(R) = \big( \mathbb{I}_{\text{NoTravel}}, \; M_{\text{Severe}}, \; M_{\text{High}}, \; \bar{S}_{\text{Risk}}, \; T_{\text{Duration}} \big)$$

1. **Safety Eligibility**: Routes containing any No-Travel mileage are flagged and penalized.
2. **Tier 1 (Severe Exposure)**: Corridor with the fewest miles in Severe conditions wins.
3. **Tier 2 (High Exposure Tiebreaker)**: If Severe mileage is identical, the route with fewest miles in High conditions wins.
4. **Tier 3 (Average Risk Tiebreaker)**: If High mileage is identical, the corridor with the lowest distance-weighted average risk score wins.
5. **Tier 4 (Efficiency Tiebreaker)**: If all risk indicators are identical, the route with the shortest transit time is selected.

---

## 🔌 REST API Specification

### `POST /api/v1/routes/evaluate`
Evaluates alternative corridors, samples weather at arrival timestamps, and outputs ranked recommendations.

**Request Body:**
```json
{
  "origin": "Denver, CO",
  "destination": "Salt Lake City, UT",
  "origin_coords": [-104.9903, 39.7392],
  "destination_coords": [-111.8910, 40.7608],
  "departure_time": "2026-10-15T08:00:00Z",
  "cargo_weight_lbs": 42000,
  "sampling_interval_miles": 25.0
}
```

**Response Highlights:**
* `ranked_routes`: Array of route options sorted by safety hierarchy.
* `recommended_route_id`: UUID of the optimal route with human-readable justification.
* `checkpoints`: Discretized GPS checkpoints with interpolated arrival time, hourly weather parameters, and risk classifications.
* `risk_segments`: Colored polyline coordinate intervals mapped directly to Leaflet/MapLibre layers.

### `GET /api/v1/corridor/grid`
Returns regional weather hazard intensity cells for the 0–48 hour timeline heatmap scrubber.
* Query Parameters: `min_lat`, `min_lon`, `max_lat`, `max_lon`, `departure_time`, `offset_hours`.

### `GET /api/v1/health`
Service health check returning provider statuses, memory footprint, and timestamp.

---

## 🛠️ Key Engineering Decisions

1. **Concurrent Weather Ingestion with Thread Pools**:
   * Querying hourly forecasts for 25 checkpoints sequentially introduces 3–5 seconds of latency. RouteShield executes Open-Meteo queries in parallel using `concurrent.futures.ThreadPoolExecutor(max_workers=10)`, lowering response times to under 450ms.
2. **Deterministic Haversine Geometry Sampling**:
   * Checkpoint spacing along GeoJSON linestrings accounts for spherical curvature via the Haversine formula, avoiding Cartesian distortion across long interstate corridors.
3. **Dual Provider Architecture**:
   * Clean dependency inversion via Python protocols allows zero-network unit testing via mock providers while supporting production routing backends (OSRM, Open-Meteo, Mapbox, HERE).

---

## 💻 Local Setup & Verification

### Prerequisites
* Python 3.11+
* Node.js 18+

### Setup
```bash
git clone https://github.com/IBRAHIMHAMID678/RouteShield.git
cd RouteShield

# Create virtual environment
python -m venv .venv
source .venv/bin/activate       # On Windows: .\.venv\Scripts\Activate.ps1

# Install backend dependencies & migrate
pip install -r requirements.txt
python manage.py migrate

# Install frontend dependencies & build bundle
cd apps/web
npm install
npm run build
cd ../..
python manage.py collectstatic --noinput

# Run unified server
python manage.py runserver 127.0.0.1:8000
```
Visit **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

---

## 🧪 Automated Test Suite

RouteShield includes an exhaustive automated test suite covering all risk boundaries, load escalation overrides, ranking ties, and REST endpoints:

```bash
pytest apps/api -v
```

```
apps/api/risk/tests/test_rules.py::TestWindClassification (6 passed)
apps/api/risk/tests/test_rules.py::TestRainClassification (6 passed)
apps/api/risk/tests/test_rules.py::TestSnowClassification (6 passed)
apps/api/risk/tests/test_rules.py::TestLoadWeightRules (4 passed)
apps/api/risk/tests/test_engine.py::TestRiskEngine (5 passed)
apps/api/routing/tests/test_sampling.py::TestRouteSampling (4 passed)
apps/api/routing/tests/test_ranking.py::TestRouteRanking (5 passed)
apps/api/services/tests/test_planner_service.py (2 passed)
apps/api/route_plans/tests/test_views.py (4 passed)

============================= 42 passed in 1.39s ==============================
```

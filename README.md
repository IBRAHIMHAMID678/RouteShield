# Weather-Aware Truck Routing — Spotter Assessment

> A commercial fleet decision-support system that evaluates alternative routes, samples hourly weather at truck arrival times, applies load-dependent hazard rules, and recommends the safest route using a deterministic 4-tier decision hierarchy.

[![Automated Test Suite](https://img.shields.io/badge/pytest-42%20passed-emerald?style=for-the-badge&logo=pytest)](file:///d:/TASK/pytest.ini)
[![Python](https://img.shields.io/badge/python-3.11+-blue?style=for-the-badge&logo=python)](file:///d:/TASK/requirements.txt)
[![Django](https://img.shields.io/badge/django-5.1-emerald?style=for-the-badge&logo=django)](file:///d:/TASK/apps/api)
[![React](https://img.shields.io/badge/react-18.3-cyan?style=for-the-badge&logo=react)](file:///d:/TASK/apps/web)
[![TypeScript](https://img.shields.io/badge/typescript-5.7-blue?style=for-the-badge&logo=typescript)](file:///d:/TASK/apps/web)

---

## 📋 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [Architecture & System Design](#-architecture--system-design)
3. [Spotter Decision Logic & Risk Rules](#-spotter-decision-logic--risk-rules)
4. [Key Engineering Decisions](#-key-engineering-decisions)
5. [Local Development Quickstart](#-local-development-quickstart)
6. [Automated Test Suite (42 Tests)](#-automated-test-suite)
7. [Deployment (Render / Docker)](#-deployment)
8. [Loom Video Walkthrough](#-loom-video-walkthrough)

---

## 🚀 Executive Summary

Commercial freight operations face severe safety risks when heavy tractor-trailers encounter localized high-wind events, heavy rain, or lake-effect snow. A wind speed of 45 mph might be manageable for an unladen flatbed, but poses a catastrophic rollover risk for a top-heavy 42,000 lb trailer.

This application solves this by:
1. **Generating 3 route options** via OSRM highway routing.
2. **Sampling checkpoints every 10, 25, or 50 miles**, calculating cumulative distance and time-interpolated estimated arrival times (ETA).
3. **Retrieving hourly weather forecasts** for each checkpoint at its exact ETA via the Open-Meteo API.
4. **Applying Spotter's risk rules and cargo load modifiers** deterministically.
5. **Selecting the recommended route** using a 4-tier lexicographical preference order.
6. **Visualizing routes, risk-segmented polylines, and interactive checkpoints** on an agency-grade dark HUD map.
7. **Providing a 0–48 hour corridor weather heatmap slider** with scrub and animation controls to evaluate departure delays.

---

## 🏛️ Architecture & System Design

```
[ Frontend: React 18 + TypeScript + Vite + MapLibre/Leaflet + Lucide Icons ]
                                   │
                                   ▼ REST API (/api/v1/)
[ Django 5 Backend & DRF ]
  ├── route_plans/          ──> Serializers & REST Controllers (clean error envelopes)
  ├── services/             ──> RoutePlannerService (Orchestration Layer)
  ├── routing/              ──> Pure Domain: Sampling (10/25/50mi), ETA, 4-Tier Ranking
  ├── risk/                 ──> Pure Domain: Wind, Rain, Snow & Load Rules (0 dependencies)
  └── providers/            ──> Protocol Adapters:
                                ├── Live: OSRM Routing + Open-Meteo Hourly Weather
                                └── Mock: Deterministic offline fixtures for instant testing
```

### Architectural Principles:
* **Framework-Independent Domain**: All math, threshold tables, load modifiers, and ranking algorithms reside in `apps/api/risk` and `apps/api/routing`. They use standard library dataclasses (`frozen=True, slots=True`) and `IntEnum`. No coupling to Django models or databases.
* **Never Silently Assume Safe Weather**: If an external weather API fails or returns missing data for a coordinate, that segment is never defaulted to "Low Risk". It is explicitly marked `weather_available=False` and the route is flagged with an unverified weather warning.
* **Single Unified Production Container**: In production, the built React SPA is served directly by Django via `WhiteNoise`, providing a single live URL with zero CORS configuration.

---

## ⚖️ Spotter Decision Logic & Risk Rules

### 1. Checkpoint Weather Thresholds
| Condition | Low | Moderate | High | Severe | No Travel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wind** | $<25\text{ mph}$ | $25\text{–}34\text{ mph}$ | $35\text{–}44\text{ mph}$ | $45\text{–}54\text{ mph}$ | $\ge 55\text{ mph}$ |
| **Rain** | $<0.10\text{ in/hr}$ | $0.10\text{–}0.25\text{ in/hr}$ | $0.25\text{–}0.50\text{ in/hr}$ | $0.50\text{–}1.00\text{ in/hr}$ | $>1.00\text{ in/hr}$ |
| **Snow** | $<0.5\text{ in/hr}$ | $0.5\text{–}1.0\text{ in/hr}$ | $1.0\text{–}2.0\text{ in/hr}$ | $2.0\text{–}3.0\text{ in/hr}$ | $>3.0\text{ in/hr}$ |

*Base checkpoint risk is the maximum severity across wind, rain, and snow.*

### 2. Cargo Load Weight Modifiers
* $\ge 55\text{ mph} \rightarrow$ **No Travel** for *any* load weight.
* $45\text{–}54\text{ mph} + >30,000\text{ lb} \rightarrow$ **No Travel** *(escalated from Severe)*.
* $35\text{–}44\text{ mph} + >40,000\text{ lb} \rightarrow$ **Severe** *(escalated from High)*.

### 3. Deterministic 4-Tier Preference Hierarchy
1. **Fewest Severe miles** (and zero No-Travel miles required for full eligibility).
2. **Fewest High miles** (breaks ties).
3. **Lowest average risk score** (breaks ties).
4. **Shortest travel time** (final tiebreaker).

Implemented via Python's native tuple comparison:
```python
RecommendationKey = tuple[int, float, float, float, float]
# (ineligible_flag, severe_miles, high_miles, average_risk_score, duration_hours)
```

---

## 🛠️ Key Engineering Decisions

1. **Why Leaflet with CartoDB Dark Matter instead of Mapbox GL?**
   * Mapbox requires private billing tokens that fail when reviewers evaluate without environment keys. Leaflet with CartoDB Dark Matter is completely open, zero-token, highly reliable, and renders custom colored polylines and canvas heatmap bubbles smoothly at 60fps.
2. **Why Open-Meteo?**
   * Unlike OpenWeatherMap or WeatherAPI which require credit cards or paid tiers for hourly forecasts, Open-Meteo provides free, high-accuracy hourly forecasts for commercial wind, precipitation, and snow up to 7 days ahead with zero rate-limit blocks.
3. **Why Dual Provider Mode?**
   * Setting `WEATHER_PROVIDER=mock` and `ROUTING_PROVIDER=mock` enables 100% offline development and executes the entire 42-test suite in $<2$ seconds in CI without network dependencies.

---

## 💻 Local Development Quickstart

### Prerequisites
* Python 3.11+
* Node.js 18+

### 1. Clone & Set Up Backend
```bash
git clone <repo-url>
cd <repo-folder>

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate       # On Windows: .\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django API server (port 8000)
python manage.py runserver
```

### 2. Set Up & Run Frontend
In a separate terminal:
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. API requests are automatically proxied to `http://localhost:8000`.

---

## 🧪 Automated Test Suite

Run the complete test suite:
```bash
pytest apps/api -v
```

### Test Coverage Highlights (42 Tests):
* **Wind Boundary Tests**: $24.9\text{ vs }25.0\text{ mph}$, $34.9\text{ vs }35.0$, $44.9\text{ vs }45.0$, $54.9\text{ vs }55.0\text{ mph}$.
* **Rain Boundary Tests**: $0.09\text{ vs }0.10$, $0.24\text{ vs }0.25$, $0.49\text{ vs }0.50$, $1.00\text{ vs }1.01\text{ in/hr}$.
* **Snow Boundary Tests**: $0.49\text{ vs }0.50$, $0.99\text{ vs }1.00$, $1.99\text{ vs }2.00$, $3.00\text{ vs }3.01\text{ in/hr}$.
* **Load Weight Overrides**: Validates escalation at $30,001\text{ lbs}$ vs $30,000\text{ lbs}$ and $40,001\text{ lbs}$ vs $40,000\text{ lbs}$.
* **Ranking Engine**: Verifies multi-tier tie-breaking across all 4 levels.
* **REST API Endpoints**: Full integration test for `/api/v1/routes/evaluate`, `/api/v1/corridor/grid`, and `/api/v1/health`.

---

## 🚢 Deployment

### 1-Click Render Deployment
The project includes a ready-to-use [`render.yaml`](file:///d:/TASK/render.yaml) Blueprint:
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Select this repository. Render automatically builds the multi-stage Docker container and launches the service.

### Docker Build & Run Locally
```bash
docker build -t spotter-weather-routing .
docker run -p 8000:8000 spotter-weather-routing
```
Visit [http://localhost:8000](http://localhost:8000) to view the unified production application.

---

## 🎥 Loom Video Walkthrough

A structured 5–10 minute video demonstration script is provided in [`docs/LOOM_SCRIPT.md`](file:///d:/TASK/docs/LOOM_SCRIPT.md).
It walks through:
1. Executive introduction and safety domain overview.
2. Architecture and pure domain logic.
3. Live interactive demo (Denver $\rightarrow$ Salt Lake City, load weight variations).
4. Interactive checkpoint inspections and 0–48h timeline scrubber.
5. Automated test suite execution in the terminal.

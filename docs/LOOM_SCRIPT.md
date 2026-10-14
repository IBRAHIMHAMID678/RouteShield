# Spotter Take-Home: 5–10 Min Loom Walkthrough Script

**Title:** Weather-Aware Truck Routing — Architectural Deep Dive & Live Demo  
**Audience:** Spotter Engineering Team  
**Goal:** Demonstrate requirement completion, deterministic decision logic, load weight modifiers, UI smoothness, and automated test suite.

---

## ⏱️ Section 1: Introduction & Objective (0:00 – 1:00)
* **Visual:** Browser showing the live web application on dark theme HUD.
* **Talking Points:**
  > *"Hi Spotter team! Today I’m walking you through my implementation of the Weather-Aware Truck Routing application. Commercial trucking operates on tight schedules, but severe weather can lead to dangerous rollovers and freight loss—especially under heavy loads.*
  > *In this solution, I built an end-to-end React and Django system that generates 3 alternative routes, samples hourly weather at precise checkpoints along the route at the truck's arrival time, applies Spotter’s exact threshold and load weight rules, and recommends the safest route using a deterministic 4-tier decision hierarchy."*

---

## ⏱️ Section 2: Architecture & Clean Code Decisions (1:00 – 2:30)
* **Visual:** Split screen or quick view of the project structure in your editor (`apps/api/risk/`, `apps/api/routing/`).
* **Talking Points:**
  > *"Before showing the live demo, I want to highlight the architecture, because code quality and maintainability were my top priorities:*
  > *1. **Pure Framework-Independent Domain Layer**: The risk calculation engine (`risk/engine.py`) and checkpoint sampler (`routing/sampling.py`) have **zero** dependencies on Django, databases, or HTTP frameworks. They use pure Python dataclasses and `IntEnum`. This means all business logic is 100% testable in isolation.*
  > *2. **Deterministic 4-Tier Sorting**: Route recommendation follows Spotter’s strict preference order: fewest Severe miles, fewest High miles, lowest average risk score, and shortest travel time. In Python, I modeled this using native lexicographical tuple keys, guaranteeing deterministic selection without arbitrary tie-breaking.*
  > *3. **Provider Protocol Pattern**: I decoupled external routing and weather APIs behind interfaces. We have real live adapters for OSRM and Open-Meteo, plus deterministic offline mocks. This guarantees CI test suites run fast and offline without failing on external network timeouts."*

---

## ⏱️ Section 3: Live Application Demonstration (2:30 – 6:00)
* **Visual:** Active interaction with the live web application.
* **Key Scenarios to Demonstrate:**

### Step A: Route Evaluation & 3 Alternatives
* Click the preset **"Denver → Salt Lake City"** (42,000 lbs, 25-mile interval).
* Click **"Evaluate Weather-Aware Routes"**.
* Show the 3 distinct alternative corridors rendered on the MapLibre/Leaflet map:
  > *"Notice that we generate 3 distinct route options. The active recommended route is highlighted in segmented risk colors—green for Low risk, amber for Moderate, orange for High, and crimson for Severe."*

### Step B: Load Weight Escalation Demonstration
* Highlight the cargo load rules:
  > *"Let's test the load weight rules. Spotter’s specification states that winds between 45–54 mph are normally Severe, but if the truck weighs over 30,000 lbs, it escalates to No Travel. If winds are 35–44 mph with over 40,000 lbs, it escalates to Severe.*
  > *Watch what happens when we increase cargo weight from 28,000 lbs to 42,000 lbs: the risk profile changes, certain segments escalate, and the engine automatically re-ranks the routes to avoid high-wind mountain passes."*

### Step C: Interactive Checkpoint Popups
* Click any checkpoint circular pin on the map.
* Show the popup HUD:
  > *"Each checkpoint calculates the truck's exact estimated arrival time (ETA) based on cumulative distance and speed. Clicking a pin reveals the exact forecast for that hour: sustained wind speed, rain precipitation rate, snowfall rate, and the exact rule justification."*

### Step D: 0–48 Hour Corridor Forecast Heatmap Slider
* Move down to the **Corridor Timeline Slider**.
* Drag the slider from $+0\text{h}$ to $+12\text{h}$, $+24\text{h}$, $+48\text{h}$, or click **"Animate"**:
  > *"Here is the 0–48 hour forecast corridor slider. As I scrub forward in time, the corridor heatmap smoothly visualizes the movement of weather systems along the trip corridor over the next two days, helping dispatchers decide if delaying departure by a few hours avoids a storm front."*

---

## ⏱️ Section 4: Automated Testing & Verification (6:00 – 7:30)
* **Visual:** Terminal executing `pytest`.
* **Action:** Run:
  ```bash
  pytest apps/api -v
  ```
* **Talking Points:**
  > *"To ensure code quality and prevent regressions, I wrote 42 automated tests covering 100% of the risk decision math and edge cases.*
  > *You can see tests validating every single threshold boundary: 24.9 vs 25.0 mph wind, 0.09 vs 0.10 in/hr rain, and 30,000 vs 30,001 lb load weight overrides.*
  > *All 42 tests execute in under 2 seconds."*

---

## ⏱️ Section 5: Deployment & Wrap-Up (7:30 – 8:30)
* **Visual:** Live hosted URL in the browser address bar (Render).
* **Talking Points:**
  > *"For production deployment, the frontend is built into optimized static assets and served directly by Django via WhiteNoise in a single multi-stage Docker container on Render. This provides a single unified URL with zero CORS complexity.*
  > *Thank you for your time and review. The complete code, test suite, and architectural documentation are in the repository. I look forward to discussing this with your team!"*

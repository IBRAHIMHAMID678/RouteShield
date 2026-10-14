import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { RouteInputForm } from "./components/RouteInputForm";
import { RouteComparison } from "./components/RouteComparison";
import { MapView } from "./components/MapView";
import { CorridorSlider } from "./components/CorridorSlider";
import { RiskRulesLegend } from "./components/RiskRulesLegend";
import { RouteOption, RoutePlanRequest, CorridorGridCell } from "./types";
import { AlertCircle, RefreshCw } from "lucide-react";

export const App: React.FC = () => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string>("");
  const [corridorGrid, setCorridorGrid] = useState<CorridorGridCell[]>([]);
  const [offsetHours, setOffsetHours] = useState<number>(0);
  const [departureTime, setDepartureTime] = useState<string>(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active route bounding box for the corridor grid
  const [boundingCoords, setBoundingCoords] = useState<{
    min_lat: number;
    min_lon: number;
    max_lat: number;
    max_lon: number;
  }>({
    min_lat: 39.0,
    min_lon: -112.5,
    max_lat: 41.5,
    max_lon: -104.5,
  });

  // Evaluate Routes API
  const handleEvaluateRoutes = async (params: RoutePlanRequest) => {
    setIsLoading(true);
    setErrorMsg(null);
    setDepartureTime(params.departure_time);

    try {
      const resp = await fetch("/api/v1/routes/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Server responded with ${resp.status}`);
      }

      const data = await resp.json();
      const evaluatedRoutes: RouteOption[] = data.routes || [];
      setRoutes(evaluatedRoutes);

      if (evaluatedRoutes.length > 0) {
        // Find recommended route or fallback to first
        const recommended = evaluatedRoutes.find((r) => r.is_recommended) || evaluatedRoutes[0];
        setActiveRouteId(recommended.route_id);

        // Compute corridor bounds
        const allLats = evaluatedRoutes.flatMap((r) =>
          r.geometry_geojson.coordinates.map((c) => c[1])
        );
        const allLons = evaluatedRoutes.flatMap((r) =>
          r.geometry_geojson.coordinates.map((c) => c[0])
        );

        if (allLats.length > 0) {
          const bounds = {
            min_lat: Math.min(...allLats) - 0.2,
            min_lon: Math.min(...allLons) - 0.2,
            max_lat: Math.max(...allLats) + 0.2,
            max_lon: Math.max(...allLons) + 0.2,
          };
          setBoundingCoords(bounds);
          fetchCorridorGrid(bounds, params.departure_time, offsetHours);
        }
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setErrorMsg(err.message || "Failed to calculate routes. Please verify inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Corridor Grid for 0-48h forecast slider
  const fetchCorridorGrid = async (
    bounds: typeof boundingCoords,
    depTime: string,
    offset: number
  ) => {
    try {
      const url = new URL("/api/v1/corridor/grid", window.location.origin);
      url.searchParams.set("min_lat", bounds.min_lat.toString());
      url.searchParams.set("min_lon", bounds.min_lon.toString());
      url.searchParams.set("max_lat", bounds.max_lat.toString());
      url.searchParams.set("max_lon", bounds.max_lon.toString());
      url.searchParams.set("departure_time", depTime);
      url.searchParams.set("offset_hours", offset.toString());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setCorridorGrid(data.grid || []);
      }
    } catch (err) {
      console.error("Corridor grid fetch failed", err);
    }
  };

  // Trigger grid update when slider offset changes
  const handleOffsetChange = (newOffset: number) => {
    setOffsetHours(newOffset);
    if (routes.length > 0) {
      fetchCorridorGrid(boundingCoords, departureTime, newOffset);
    }
  };

  // Initial Benchmark Load on mount: Denver to Salt Lake City
  useEffect(() => {
    handleEvaluateRoutes({
      origin_lat: 39.7392,
      origin_lon: -104.9903,
      dest_lat: 40.7608,
      dest_lon: -111.8910,
      origin_name: "Denver, CO",
      dest_name: "Salt Lake City, UT",
      departure_time: departureTime,
      load_weight_lb: 42000,
      sampling_interval_miles: 25.0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-mono underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Form */}
        <RouteInputForm onSubmit={handleEvaluateRoutes} isLoading={isLoading} />

        {/* Route Comparison Cards */}
        {routes.length > 0 && (
          <RouteComparison
            routes={routes}
            activeRouteId={activeRouteId}
            onSelectRoute={(id) => setActiveRouteId(id)}
          />
        )}

        {/* Map View & Heatmap */}
        <div className="space-y-4">
          <MapView
            routes={routes}
            activeRouteId={activeRouteId}
            corridorGrid={corridorGrid}
          />

          {/* 0-48h Corridor Forecast Slider */}
          <CorridorSlider
            offsetHours={offsetHours}
            departureTime={departureTime}
            onOffsetChange={handleOffsetChange}
          />
        </div>

        {/* Specification & Rules Legend */}
        <RiskRulesLegend />
      </main>

      <footer className="border-t border-slate-900 bg-[#060910] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <p>RouteShield™ Fleet Intelligence · Weather-Aware Commercial Routing & Operational Risk Engine</p>
      </footer>
    </div>
  );
};

export default App;

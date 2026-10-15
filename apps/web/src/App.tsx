import React, { useState, useEffect } from "react";
import { SidebarDrawer } from "./components/SidebarDrawer";
import { MapView } from "./components/MapView";
import { CorridorSlider } from "./components/CorridorSlider";
import { RiskRulesModal } from "./components/RiskRulesModal";
import { RouteOption, RoutePlanRequest, CorridorGridCell } from "./types";
import { AlertCircle, PanelLeftClose, PanelLeftOpen, Layers } from "lucide-react";

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
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

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

  // Initial Benchmark Load on mount: Chicago to Dallas
  useEffect(() => {
    handleEvaluateRoutes({
      origin_lat: 41.8781,
      origin_lon: -87.6298,
      dest_lat: 32.7767,
      dest_lon: -96.7970,
      origin_name: "Chicago, IL",
      dest_name: "Dallas, TX",
      departure_time: departureTime,
      load_weight_lb: 38000,
      sampling_interval_miles: 25.0,
    });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans">
      {/* 1. Full-Bleed Map View */}
      <MapView
        routes={routes}
        activeRouteId={activeRouteId}
        corridorGrid={corridorGrid}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-[450] bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* 2. Floating Left Sidebar Drawer */}
      {isSidebarOpen && (
        <SidebarDrawer
          routes={routes}
          activeRouteId={activeRouteId}
          onSelectRoute={(id) => setActiveRouteId(id)}
          onSubmit={handleEvaluateRoutes}
          isLoading={isLoading}
          onOpenRules={() => setIsRulesOpen(true)}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Toggle Button */}
      {isSidebarOpen ? (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          title="Collapse Sidebar"
          className="hidden lg:flex absolute top-4 left-[416px] z-[600] p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-slate-50 transition cursor-pointer items-center justify-center"
        >
          <PanelLeftClose className="w-4 h-4 text-slate-600" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          title="Open Trip Planner"
          className="absolute top-4 left-4 z-[600] py-2 px-3 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-teal-800 shadow-md hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
        >
          <PanelLeftOpen className="w-4 h-4 text-teal-700" />
          <span className="text-xs font-semibold sm:inline">Plan Trip</span>
          {routes.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-mono">
              {routes.length}
            </span>
          )}
        </button>
      )}

      {/* 3. Floating 0-48h Corridor Forecast Slider (Bottom Center) */}
      <div
        className={`absolute bottom-3 sm:bottom-6 z-[400] transition-all duration-300 ${
          isSidebarOpen
            ? "hidden lg:block lg:left-[436px] lg:right-6 lg:max-w-2xl"
            : "left-2.5 right-2.5 sm:left-6 sm:right-6 max-w-2xl mx-auto"
        }`}
      >
        <CorridorSlider
          offsetHours={offsetHours}
          departureTime={departureTime}
          onOffsetChange={handleOffsetChange}
        />
      </div>

      {/* 4. Floating Error Toast */}
      {errorMsg && (
        <div className="absolute top-4 right-4 z-[1000] p-4 max-w-md bg-white border border-red-200 rounded-2xl shadow-xl flex items-start gap-3 text-xs text-red-700 animate-slide-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Route Calculation Warning</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* 5. Safety Rules Reference Modal */}
      <RiskRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};

export default App;

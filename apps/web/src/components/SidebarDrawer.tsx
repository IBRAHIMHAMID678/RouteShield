import React, { useState } from "react";
import { RouteOption, RoutePlanRequest } from "../types";
import {
  Shield,
  Truck,
  MapPin,
  Calendar,
  Weight,
  Sliders,
  Sparkles,
  ArrowRight,
  Route as RouteIcon,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Info
} from "lucide-react";

interface Props {
  routes: RouteOption[];
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
  onSubmit: (params: RoutePlanRequest) => void;
  isLoading: boolean;
  onOpenRules: () => void;
}

const PRESETS = [
  {
    name: "Chicago → Dallas",
    desc: "Midwest to Southern Plains",
    origin_name: "Chicago, IL",
    dest_name: "Dallas, TX",
    origin_lat: 41.8781,
    origin_lon: -87.6298,
    dest_lat: 32.7767,
    dest_lon: -96.7970,
    weight: 38000,
  },
  {
    name: "Denver → Salt Lake",
    desc: "Rocky Mountain Pass (Wind & Snow)",
    origin_name: "Denver, CO",
    dest_name: "Salt Lake City, UT",
    origin_lat: 39.7392,
    origin_lon: -104.9903,
    dest_lat: 40.7608,
    dest_lon: -111.8910,
    weight: 42000,
  },
  {
    name: "Phoenix → Denver",
    desc: "High Elevation Corridor",
    origin_name: "Phoenix, AZ",
    dest_name: "Denver, CO",
    origin_lat: 33.4484,
    origin_lon: -112.0740,
    dest_lat: 39.7392,
    dest_lon: -104.9903,
    weight: 32000,
  },
];

export const SidebarDrawer: React.FC<Props> = ({
  routes,
  activeRouteId,
  onSelectRoute,
  onSubmit,
  isLoading,
  onOpenRules,
}) => {
  const [activeTab, setActiveTab] = useState<"plan" | "routes">("plan");

  // Form State: Default to benchmark corridor Denver -> Salt Lake
  const [originName, setOriginName] = useState("Denver, CO");
  const [originLat, setOriginLat] = useState(39.7392);
  const [originLon, setOriginLon] = useState(-104.9903);

  const [destName, setDestName] = useState("Salt Lake City, UT");
  const [destLat, setDestLat] = useState(40.7608);
  const [destLon, setDestLon] = useState(-111.8910);

  const defaultDeparture = new Date(Date.now() + 2 * 3600 * 1000)
    .toISOString()
    .slice(0, 16);
  const [departureTime, setDepartureTime] = useState(defaultDeparture);

  const [loadWeight, setLoadWeight] = useState<number>(38000);
  const [interval, setInterval] = useState<number>(25);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      origin_lat: originLat,
      origin_lon: originLon,
      dest_lat: destLat,
      dest_lon: destLon,
      origin_name: originName,
      dest_name: destName,
      departure_time: new Date(departureTime).toISOString(),
      load_weight_lb: Number(loadWeight),
      sampling_interval_miles: Number(interval),
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setOriginName(preset.origin_name);
    setDestName(preset.dest_name);
    setOriginLat(preset.origin_lat);
    setOriginLon(preset.origin_lon);
    setDestLat(preset.dest_lat);
    setDestLon(preset.dest_lon);
    setLoadWeight(preset.weight);
  };

  // Switch to routes tab automatically when routes arrive
  React.useEffect(() => {
    if (routes.length > 0) {
      setActiveTab("routes");
    }
  }, [routes]);

  return (
    <aside className="absolute top-4 left-4 bottom-6 w-[400px] max-w-[calc(100vw-32px)] z-[500] flex flex-col bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden text-slate-800">
      {/* Brand Header */}
      <div className="p-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-teal-900">
                RouteShield
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            Weather-Aware
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("plan")}
            className={`flex-1 pb-2.5 text-center transition relative ${
              activeTab === "plan"
                ? "text-teal-800 font-bold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Plan Trip
            {activeTab === "plan" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("routes")}
            disabled={routes.length === 0}
            className={`flex-1 pb-2.5 text-center transition relative flex items-center justify-center gap-1.5 ${
              routes.length === 0
                ? "text-slate-300 cursor-not-allowed"
                : activeTab === "routes"
                ? "text-teal-800 font-bold"
                : "text-slate-400 hover:text-slate-600 cursor-pointer"
            }`}
          >
            <span>Routes</span>
            {routes.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] flex items-center justify-center font-mono">
                {routes.length}
              </span>
            )}
            {activeTab === "routes" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === "plan" ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Plan a truck route and compare weather-risk alternatives based on vehicle gross weight and hourly arrival forecasts.
            </p>

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick examples
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Origin Input */}
            <div className="relative border border-slate-200 rounded-xl p-2.5 hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Origin
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                <input
                  type="text"
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  placeholder="e.g. Chicago, IL"
                  className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            {/* Destination Input */}
            <div className="relative border border-slate-200 rounded-xl p-2.5 hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Destination
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  placeholder="e.g. Dallas, TX"
                  className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            {/* Departure Date and Time */}
            <div className="border border-slate-200 rounded-xl p-2.5 hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Departure date and time
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Interpreted in your local timezone.
              </p>
            </div>

            {/* Cargo Load Weight */}
            <div className="border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5" />
                  <span>Cargo Weight (lbs)</span>
                </label>
                <span className="font-mono text-xs font-bold text-teal-800">
                  {loadWeight.toLocaleString()} lbs
                </span>
              </div>

              {/* Weight chips */}
              <div className="grid grid-cols-4 gap-1 mb-2">
                {[
                  { label: "15k", val: 15000, desc: "Empty" },
                  { label: "32k", val: 32000, desc: ">30k" },
                  { label: "42k", val: 42000, desc: ">40k" },
                  { label: "80k", val: 80000, desc: "Max" },
                ].map((w) => (
                  <button
                    key={w.val}
                    type="button"
                    onClick={() => setLoadWeight(w.val)}
                    className={`py-1 rounded-lg text-center font-mono text-xs border transition cursor-pointer ${
                      loadWeight === w.val
                        ? "bg-teal-700 text-white border-teal-700 font-bold shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>{w.label}</div>
                    <div className="text-[9px] opacity-75">{w.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkpoint Sampling Interval */}
            <div className="border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Checkpoint Resolution</span>
                </label>
                <span className="font-mono text-xs font-bold text-teal-800">
                  Every {interval} miles
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[10, 25, 50].map((intv) => (
                  <button
                    key={intv}
                    type="button"
                    onClick={() => setInterval(intv)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                      interval === intv
                        ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {intv} mi
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-heading font-bold text-sm text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.99] transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating 3 Routes...</span>
                </>
              ) : (
                <>
                  <span>Evaluate 3 Routes</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Routes Tab */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-1 border-b border-slate-100">
              <span>{routes.length} Route Options</span>
              <span>Ranked by Safety Hierarchy</span>
            </div>

            {routes.map((r) => {
              const isSelected = r.route_id === activeRouteId;
              const isRecommended = r.is_recommended;

              return (
                <div
                  key={r.route_id}
                  onClick={() => onSelectRoute(r.route_id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                      Rank #{r.recommendation_rank}
                    </span>

                    {isRecommended ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Award className="w-3 h-3 text-emerald-700" />
                        RECOMMENDED
                      </span>
                    ) : !r.is_eligible ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
                        <AlertTriangle className="w-3 h-3" />
                        HAZARDOUS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono text-slate-500 bg-slate-100">
                        Alternative
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">
                    {r.route_name}
                  </h4>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600 mb-2.5">
                    <span className="flex items-center gap-1">
                      <RouteIcon className="w-3.5 h-3.5 text-slate-400" />
                      {r.total_distance_miles.toFixed(1)} mi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {r.total_duration_hours.toFixed(1)} hrs
                    </span>
                    <span>
                      Avg Risk: <b>{r.average_risk_score.toFixed(2)}</b>
                    </span>
                  </div>

                  {/* Risk Profile Breakdown */}
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] mb-2">
                    <div className="px-1 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <div className="text-emerald-600">Low</div>
                      <div className="font-bold">{r.low_miles.toFixed(0)}m</div>
                    </div>
                    <div className="px-1 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      <div className="text-amber-600">Mod</div>
                      <div className="font-bold">{r.moderate_miles.toFixed(0)}m</div>
                    </div>
                    <div className="px-1 py-1 rounded bg-orange-50 text-orange-800 border border-orange-200">
                      <div className="text-orange-600">High</div>
                      <div className="font-bold">{r.high_miles.toFixed(0)}m</div>
                    </div>
                    <div className="px-1 py-1 rounded bg-red-50 text-red-800 border border-red-200">
                      <div className="text-red-600">Severe</div>
                      <div className="font-bold">{r.severe_miles.toFixed(0)}m</div>
                    </div>
                  </div>

                  {r.hazard_alerts && r.hazard_alerts.length > 0 && (
                    <div className="text-[11px] text-red-700 bg-red-50/80 rounded-lg p-2 border border-red-200 leading-tight">
                      ⚠️ {r.hazard_alerts[0]}
                    </div>
                  )}

                  <div className="mt-2 text-right">
                    <span className="text-[11px] font-semibold text-teal-700 flex items-center justify-end gap-1">
                      {isSelected ? "Active on Map ✓" : "Click to View on Map →"}
                    </span>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveTab("plan")}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-center"
            >
              ← Edit Trip Parameters
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
        <button
          type="button"
          onClick={onOpenRules}
          className="flex items-center gap-1.5 hover:text-teal-800 transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-700" />
          <span>Safety Standards Reference</span>
        </button>
        <span className="text-[10px] font-mono text-slate-400">
          OSRM + Open-Meteo
        </span>
      </div>
    </aside>
  );
};

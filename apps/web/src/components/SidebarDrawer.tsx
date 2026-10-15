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
  Info,
  X,
  ArrowUpDown,
} from "lucide-react";
import { searchLocalCities, resolveLocationCoords, CityLocation } from "../utils/cities";

interface Props {
  routes: RouteOption[];
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
  onSubmit: (params: RoutePlanRequest) => void;
  isLoading: boolean;
  onOpenRules: () => void;
  onClose?: () => void;
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
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"plan" | "routes">("plan");

  // Form State: Default to benchmark corridor Chicago -> Dallas
  const [originName, setOriginName] = useState("Chicago, IL");
  const [originLat, setOriginLat] = useState(41.8781);
  const [originLon, setOriginLon] = useState(-87.6298);

  const [destName, setDestName] = useState("Dallas, TX");
  const [destLat, setDestLat] = useState(32.7767);
  const [destLon, setDestLon] = useState(-96.7970);

  const [originSuggestions, setOriginSuggestions] = useState<CityLocation[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<CityLocation[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const defaultDeparture = new Date(Date.now() + 2 * 3600 * 1000)
    .toISOString()
    .slice(0, 16);
  const [departureTime, setDepartureTime] = useState(defaultDeparture);

  const [loadWeight, setLoadWeight] = useState<number>(38000);
  const [interval, setInterval] = useState<number>(25);

  const handleOriginChange = (val: string) => {
    setOriginName(val);
    setGeoError(null);
    if (val.trim().length >= 2) {
      const results = searchLocalCities(val);
      setOriginSuggestions(results);
      setShowOriginSuggestions(results.length > 0);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  const handleSelectOrigin = (city: CityLocation) => {
    const fullName = `${city.name}, ${city.state}`;
    setOriginName(fullName);
    setOriginLat(city.lat);
    setOriginLon(city.lon);
    setShowOriginSuggestions(false);
    setGeoError(null);
  };

  const handleDestChange = (val: string) => {
    setDestName(val);
    setGeoError(null);
    if (val.trim().length >= 2) {
      const results = searchLocalCities(val);
      setDestSuggestions(results);
      setShowDestSuggestions(results.length > 0);
    } else {
      setShowDestSuggestions(false);
    }
  };

  const handleSelectDest = (city: CityLocation) => {
    const fullName = `${city.name}, ${city.state}`;
    setDestName(fullName);
    setDestLat(city.lat);
    setDestLon(city.lon);
    setShowDestSuggestions(false);
    setGeoError(null);
  };

  const handleSwap = () => {
    const tempName = originName;
    const tempLat = originLat;
    const tempLon = originLon;

    setOriginName(destName);
    setOriginLat(destLat);
    setOriginLon(destLon);

    setDestName(tempName);
    setDestLat(tempLat);
    setDestLon(tempLon);
    setShowOriginSuggestions(false);
    setShowDestSuggestions(false);
    setGeoError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeoError(null);

    let curOriginLat = originLat;
    let curOriginLon = originLon;
    let curDestLat = destLat;
    let curDestLon = destLon;

    // Check if origin was resolved
    const resolvedOrigin = await resolveLocationCoords(originName);
    if (resolvedOrigin) {
      curOriginLat = resolvedOrigin.lat;
      curOriginLon = resolvedOrigin.lon;
      setOriginLat(curOriginLat);
      setOriginLon(curOriginLon);
    } else if (!curOriginLat) {
      setGeoError(`Could not locate origin: "${originName}". Please pick a US city from suggestions.`);
      return;
    }

    // Check if destination was resolved
    const resolvedDest = await resolveLocationCoords(destName);
    if (resolvedDest) {
      curDestLat = resolvedDest.lat;
      curDestLon = resolvedDest.lon;
      setDestLat(curDestLat);
      setDestLon(curDestLon);
    } else if (!curDestLat) {
      setGeoError(`Could not locate destination: "${destName}". Please pick a US city from suggestions.`);
      return;
    }

    setShowOriginSuggestions(false);
    setShowDestSuggestions(false);

    onSubmit({
      origin_lat: curOriginLat,
      origin_lon: curOriginLon,
      dest_lat: curDestLat,
      dest_lon: curDestLon,
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
    setShowOriginSuggestions(false);
    setShowDestSuggestions(false);
    setGeoError(null);
  };

  // Switch to routes tab automatically when routes arrive
  React.useEffect(() => {
    if (routes.length > 0) {
      setActiveTab("routes");
    }
  }, [routes]);

  return (
    <aside className="fixed sm:absolute top-2 sm:top-4 left-2 sm:left-4 bottom-2 sm:bottom-6 w-[calc(100vw-16px)] sm:w-[400px] max-w-[420px] z-[500] flex flex-col bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden text-slate-800 transition-all">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100">
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
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Weather-Aware
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close drawer"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
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
            <div className="relative">
              <div className="border border-slate-200 rounded-xl p-2.5 hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition bg-white">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Origin
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                    GPS [{originLat.toFixed(1)}, {originLon.toFixed(1)}] ✓
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                  <input
                    type="text"
                    value={originName}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    onFocus={() => {
                      if (originName.trim().length >= 2) {
                        const res = searchLocalCities(originName);
                        setOriginSuggestions(res);
                        setShowOriginSuggestions(res.length > 0);
                      }
                    }}
                    placeholder="e.g. New York, NY"
                    className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Origin Autocomplete Suggestions */}
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[700] py-1 max-h-48 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Suggested US Freight Hubs
                  </div>
                  {originSuggestions.map((c) => (
                    <button
                      key={`orig-${c.name}-${c.state}`}
                      type="button"
                      onClick={() => handleSelectOrigin(c)}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="font-semibold">{c.name}, {c.state}</span>
                      <span className="text-[10px] font-mono text-slate-400">[{c.lat.toFixed(2)}, {c.lon.toFixed(2)}]</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Origin <-> Destination Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap Origin and Destination"
                className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition shadow-xs cursor-pointer flex items-center gap-1.5 text-[11px] font-medium"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Swap Route</span>
              </button>
            </div>

            {/* Destination Input */}
            <div className="relative">
              <div className="border border-slate-200 rounded-xl p-2.5 hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition bg-white">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Destination
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                    GPS [{destLat.toFixed(1)}, {destLon.toFixed(1)}] ✓
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={destName}
                    onChange={(e) => handleDestChange(e.target.value)}
                    onFocus={() => {
                      if (destName.trim().length >= 2) {
                        const res = searchLocalCities(destName);
                        setDestSuggestions(res);
                        setShowDestSuggestions(res.length > 0);
                      }
                    }}
                    placeholder="e.g. Los Angeles, CA"
                    className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Destination Autocomplete Suggestions */}
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[700] py-1 max-h-48 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Suggested US Freight Hubs
                  </div>
                  {destSuggestions.map((c) => (
                    <button
                      key={`dest-${c.name}-${c.state}`}
                      type="button"
                      onClick={() => handleSelectDest(c)}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="font-semibold">{c.name}, {c.state}</span>
                      <span className="text-[10px] font-mono text-slate-400">[{c.lat.toFixed(2)}, {c.lon.toFixed(2)}]</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {geoError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}

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

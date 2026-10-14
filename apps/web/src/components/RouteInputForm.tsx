import React, { useState } from "react";
import { RoutePlanRequest } from "../types";
import { MapPin, Calendar, Weight, Sliders, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  onSubmit: (params: RoutePlanRequest) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: "Denver → Salt Lake City",
    desc: "Rocky Mountain Pass (Wind & Snow)",
    origin_lat: 39.7392,
    origin_lon: -104.9903,
    dest_lat: 40.7608,
    dest_lon: -111.8910,
    weight: 42000,
  },
  {
    name: "Chicago → Detroit",
    desc: "Midwest Freight Corridor",
    origin_lat: 41.8781,
    origin_lon: -87.6298,
    dest_lat: 42.3314,
    dest_lon: -83.0458,
    weight: 35000,
  },
  {
    name: "Dallas → Atlanta",
    desc: "Southern Interstate I-20",
    origin_lat: 32.7767,
    origin_lon: -96.7970,
    dest_lat: 33.7490,
    dest_lon: -84.3880,
    weight: 28000,
  },
];

export const RouteInputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [originName, setOriginName] = useState("Denver, CO");
  const [originLat, setOriginLat] = useState(39.7392);
  const [originLon, setOriginLon] = useState(-104.9903);

  const [destName, setDestName] = useState("Salt Lake City, UT");
  const [destLat, setDestLat] = useState(40.7608);
  const [destLon, setDestLon] = useState(-111.8910);

  // Default to today + 2 hours formatted for datetime-local
  const defaultDeparture = new Date(Date.now() + 2 * 3600 * 1000)
    .toISOString()
    .slice(0, 16);
  const [departureTime, setDepartureTime] = useState(defaultDeparture);

  const [loadWeight, setLoadWeight] = useState<number>(42000);
  const [interval, setInterval] = useState<number>(25);

  const handleSubmit = (e: React.FormEvent) => {
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
    const parts = preset.name.split(" → ");
    setOriginName(parts[0]);
    setDestName(parts[1]);
    setOriginLat(preset.origin_lat);
    setOriginLon(preset.origin_lon);
    setDestLat(preset.dest_lat);
    setDestLon(preset.dest_lon);
    setLoadWeight(preset.weight);
  };

  return (
    <div className="bg-[#0f172a]/95 rounded-2xl border border-slate-800 p-5 shadow-xl">
      {/* Quick Presets */}
      <div className="mb-5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Benchmark Presets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Origin</span>
            </label>
            <input
              type="text"
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              placeholder="e.g. Denver, CO"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              required
            />
            <div className="flex gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
              <span>Lat: {originLat.toFixed(4)}</span>
              <span>Lon: {originLon.toFixed(4)}</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Destination</span>
            </label>
            <input
              type="text"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              placeholder="e.g. Salt Lake City, UT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              required
            />
            <div className="flex gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
              <span>Lat: {destLat.toFixed(4)}</span>
              <span>Lon: {destLon.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Departure, Load Weight, and Interval */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Departure Date/Time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Departure Time (UTC)</span>
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono"
              required
            />
          </div>

          {/* Load Weight */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Weight className="w-4 h-4 text-purple-400" />
                <span>Cargo Weight</span>
              </label>
              <span className="text-xs font-mono font-semibold text-purple-400">
                {Number(loadWeight).toLocaleString()} lbs
              </span>
            </div>
            <input
              type="number"
              min={1000}
              max={100000}
              step={1000}
              value={loadWeight}
              onChange={(e) => setLoadWeight(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 transition font-mono"
              required
            />
            {/* Weight Presets */}
            <div className="flex gap-1.5 mt-2">
              {[
                { label: "15k (Empty)", val: 15000 },
                { label: "32k (>30k lb)", val: 32000 },
                { label: "42k (>40k lb)", val: 42000 },
                { label: "80k (Max)", val: 80000 },
              ].map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setLoadWeight(w.val)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition ${
                    loadWeight === w.val
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                      : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sampling Interval */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Checkpoint Interval</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 25, 50].map((intVal) => (
                <button
                  key={intVal}
                  type="button"
                  onClick={() => setInterval(intVal)}
                  className={`py-2 rounded-xl text-xs font-mono font-semibold border transition ${
                    interval === intVal
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {intVal} mi
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">
              Samples weather every {interval} miles along route.
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-heading font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating 3 Alternative Routes & Sampling Forecasts...</span>
              </>
            ) : (
              <>
                <span>Evaluate Weather-Aware Routes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

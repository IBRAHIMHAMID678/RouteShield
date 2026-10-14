import React from "react";
import { RouteOption } from "../types";
import { Award, Clock, Route, AlertTriangle, CheckCircle, Flame, ShieldAlert } from "lucide-react";

interface Props {
  routes: RouteOption[];
  activeRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const RouteComparison: React.FC<Props> = ({
  routes,
  activeRouteId,
  onSelectRoute,
}) => {
  if (!routes || routes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <Route className="w-4 h-4 text-emerald-400" />
          <span>3 Route Options Evaluated</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Ranked by: Severe Miles → High Miles → Avg Risk → Travel Time
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((r) => {
          const isSelected = r.route_id === activeRouteId;
          const isRecommended = r.is_recommended;

          return (
            <div
              key={r.route_id}
              onClick={() => onSelectRoute(r.route_id)}
              className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-slate-900/95 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500"
                  : "bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Rank #{r.recommendation_rank}
                </span>

                {isRecommended ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    RECOMMENDED
                  </span>
                ) : !r.is_eligible ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    HAZARDOUS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono text-slate-400 bg-slate-800">
                    Alternative
                  </span>
                )}
              </div>

              {/* Route Name and Distance */}
              <div className="mb-3">
                <h4 className="font-heading font-bold text-sm text-white mb-1">
                  {r.route_name}
                </h4>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1">
                    <Route className="w-3.5 h-3.5 text-slate-500" />
                    {r.total_distance_miles.toFixed(1)} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {r.total_duration_hours.toFixed(1)} hrs
                  </span>
                </div>
              </div>

              {/* Risk Miles Bar */}
              <div className="space-y-1.5 mb-3 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Risk Profile:</span>
                  <span className="text-slate-300 font-semibold">
                    Avg Score: {r.average_risk_score.toFixed(2)} / 5.0
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                  <div className="px-1.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <div className="text-[10px] text-emerald-500">Low</div>
                    <div className="font-bold">{r.low_miles.toFixed(0)}m</div>
                  </div>
                  <div className="px-1.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <div className="text-[10px] text-amber-500">Mod</div>
                    <div className="font-bold">{r.moderate_miles.toFixed(0)}m</div>
                  </div>
                  <div className="px-1.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-300">
                    <div className="text-[10px] text-orange-500">High</div>
                    <div className="font-bold">{r.high_miles.toFixed(0)}m</div>
                  </div>
                  <div className={`px-1.5 py-1 rounded border font-bold ${
                    r.severe_miles > 0
                      ? "bg-red-500/20 border-red-500/50 text-red-300"
                      : "bg-slate-800/40 border-slate-800 text-slate-500"
                  }`}>
                    <div className="text-[10px] text-red-400">Severe</div>
                    <div>{r.severe_miles.toFixed(0)}m</div>
                  </div>
                </div>

                {r.no_travel_miles > 0 && (
                  <div className="mt-1 px-2 py-1 rounded bg-red-950/50 border border-red-800 text-[11px] font-mono text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{r.no_travel_miles.toFixed(1)} miles exceed safe load travel threshold</span>
                  </div>
                )}
              </div>

              {/* Justification summary */}
              <div className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                {r.recommendation_reasons[0] || r.summary_description}
              </div>

              {/* Active Route Selection Indicator */}
              <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                <span className={`font-mono text-[11px] font-semibold ${isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                  {isSelected ? "Active On Map" : "Click to View on Map"}
                </span>
                {isSelected && (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

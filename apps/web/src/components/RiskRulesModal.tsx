import React from "react";
import { X, Shield, Wind, CloudRain, Snowflake, Scale, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskRulesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Safety Thresholds & Rules Reference
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic Meteorological Classification & Gross Weight Overrides
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Table */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              1. Weather Hazard Thresholds (Per Checkpoint)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                    <th className="py-2 px-3">Hazard</th>
                    <th className="py-2 px-3 text-emerald-700 font-bold">Low</th>
                    <th className="py-2 px-3 text-amber-700 font-bold">Moderate</th>
                    <th className="py-2 px-3 text-orange-700 font-bold">High</th>
                    <th className="py-2 px-3 text-red-600 font-bold">Severe</th>
                    <th className="py-2 px-3 text-red-900 font-bold">No Travel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold flex items-center gap-1.5 text-slate-900">
                      <Wind className="w-3.5 h-3.5 text-teal-600" /> Wind
                    </td>
                    <td className="py-2 px-3">&lt; 25 mph</td>
                    <td className="py-2 px-3">25–34 mph</td>
                    <td className="py-2 px-3">35–44 mph</td>
                    <td className="py-2 px-3">45–54 mph</td>
                    <td className="py-2 px-3 font-bold text-red-700">≥ 55 mph</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold flex items-center gap-1.5 text-slate-900">
                      <CloudRain className="w-3.5 h-3.5 text-teal-600" /> Rain
                    </td>
                    <td className="py-2 px-3">&lt; 0.10 in/h</td>
                    <td className="py-2 px-3">0.10–0.25 in/h</td>
                    <td className="py-2 px-3">0.25–0.50 in/h</td>
                    <td className="py-2 px-3">0.50–1.00 in/h</td>
                    <td className="py-2 px-3 font-bold text-red-700">&gt; 1.00 in/h</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold flex items-center gap-1.5 text-slate-900">
                      <Snowflake className="w-3.5 h-3.5 text-teal-600" /> Snow
                    </td>
                    <td className="py-2 px-3">&lt; 0.5 in/h</td>
                    <td className="py-2 px-3">0.5–1.0 in/h</td>
                    <td className="py-2 px-3">1.0–2.0 in/h</td>
                    <td className="py-2 px-3">2.0–3.0 in/h</td>
                    <td className="py-2 px-3 font-bold text-red-700">&gt; 3.0 in/h</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Load Modifiers */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              2. Cargo Weight Escalation Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-slate-800">
                <div className="font-bold text-red-700 text-xs mb-1">Universal Hard Stop</div>
                <div className="text-[11px] text-slate-600">
                  Wind <b>≥ 55 mph</b> triggers an immediate <b>No Travel</b> stop regardless of weight.
                </div>
              </div>
              <div className="p-3 rounded-xl border border-orange-200 bg-orange-50 text-slate-800">
                <div className="font-bold text-orange-800 text-xs mb-1">Heavy Load Escalation</div>
                <div className="text-[11px] text-slate-600">
                  Wind <b>45–54 mph</b> with cargo <b>&gt; 30,000 lbs</b> escalates to <b>No Travel</b>.
                </div>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-slate-800">
                <div className="font-bold text-amber-800 text-xs mb-1">Extreme Mass Escalation</div>
                <div className="text-[11px] text-slate-600">
                  Wind <b>35–44 mph</b> with cargo <b>&gt; 40,000 lbs</b> escalates from High to <b>Severe</b>.
                </div>
              </div>
            </div>
          </div>

          {/* 4-Tier Hierarchy */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              3. Deterministic 4-Tier Recommendation Order
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
              <li><b>Tier 1:</b> Fewest miles in Severe conditions (zero No-Travel miles required).</li>
              <li><b>Tier 2:</b> Fewest miles in High conditions (breaks ties).</li>
              <li><b>Tier 3:</b> Lowest average risk score (breaks ties).</li>
              <li><b>Tier 4:</b> Shortest travel duration (final tiebreaker).</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};

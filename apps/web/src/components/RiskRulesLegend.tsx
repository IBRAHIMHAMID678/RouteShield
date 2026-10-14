import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Scale, CheckCircle2 } from "lucide-react";

export const RiskRulesLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#0f172a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h4 className="font-heading font-bold text-sm text-white group-hover:text-emerald-400 transition">
            RouteShield Safety Standards & Threshold Reference
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{isOpen ? "Collapse Rules" : "Expand Official Thresholds"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs">
          {/* Thresholds Table */}
          <div>
            <h5 className="font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Weather Condition Thresholds
            </h5>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-1.5 px-2">Condition</th>
                    <th className="py-1.5 px-2 text-emerald-400">Low</th>
                    <th className="py-1.5 px-2 text-amber-400">Moderate</th>
                    <th className="py-1.5 px-2 text-orange-400">High</th>
                    <th className="py-1.5 px-2 text-red-400">Severe</th>
                    <th className="py-1.5 px-2 text-red-600">No Travel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-white">Wind</td>
                    <td className="py-1.5 px-2">&lt;25 mph</td>
                    <td className="py-1.5 px-2">25–34</td>
                    <td className="py-1.5 px-2">35–44</td>
                    <td className="py-1.5 px-2">45–54</td>
                    <td className="py-1.5 px-2 font-bold text-red-400">≥55 mph</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-white">Rain</td>
                    <td className="py-1.5 px-2">&lt;0.10 in/hr</td>
                    <td className="py-1.5 px-2">0.10–0.25</td>
                    <td className="py-1.5 px-2">0.25–0.50</td>
                    <td className="py-1.5 px-2">0.50–1.00</td>
                    <td className="py-1.5 px-2 font-bold text-red-400">&gt;1.00 in/hr</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-white">Snow</td>
                    <td className="py-1.5 px-2">&lt;0.5 in/hr</td>
                    <td className="py-1.5 px-2">0.5–1.0</td>
                    <td className="py-1.5 px-2">1.0–2.0</td>
                    <td className="py-1.5 px-2">2.0–3.0</td>
                    <td className="py-1.5 px-2 font-bold text-red-400">&gt;3.0 in/hr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Load Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h5 className="font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Cargo Load Weight Rules</span>
              </h5>
              <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span><b className="text-white">≥55 mph</b> → <span className="text-red-400 font-bold">No Travel</span> for any load weight</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span><b className="text-white">45–54 mph + &gt;30,000 lb</b> → <span className="text-red-400 font-bold">No Travel</span> (escalated)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><b className="text-white">35–44 mph + &gt;40,000 lb</b> → <span className="text-amber-400 font-bold">Severe</span> (escalated)</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. 4-Tier Recommendation Order</span>
              </h5>
              <ol className="space-y-1 text-slate-400 font-mono text-[11px] list-decimal list-inside">
                <li><b className="text-white">Fewest Severe miles</b> (0 No-Travel miles required)</li>
                <li><b className="text-white">Fewest High miles</b> (break ties)</li>
                <li><b className="text-white">Lowest average risk score</b> (break ties)</li>
                <li><b className="text-white">Shortest travel times</b> (final tiebreaker)</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

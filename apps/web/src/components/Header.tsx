import React from "react";
import { Truck, ShieldCheck, CloudRain, Navigation } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[#1e293b] bg-[#0c1322]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xl text-white tracking-tight">spotter</span>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Weather-Aware Routing
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Commercial Fleet Safety & Operational Risk Evaluation System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Risk Engine</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span>Open-Meteo Hourly</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>OSRM 3-Corridor</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Clock, CloudLightning } from "lucide-react";

interface Props {
  offsetHours: number;
  departureTime: string;
  onOffsetChange: (hours: number) => void;
}

export const CorridorSlider: React.FC<Props> = ({
  offsetHours,
  departureTime,
  onOffsetChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Automated scrubbing playback
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        onOffsetChange((offsetHours + 2) % 50);
      }, 700);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, offsetHours, onOffsetChange]);

  const depDate = new Date(departureTime || Date.now());
  const forecastDate = new Date(depDate.getTime() + offsetHours * 3600 * 1000);

  return (
    <div className="bg-[#0f172a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CloudLightning className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">
              Trip Corridor Weather Heatmap
            </h4>
            <p className="text-xs text-slate-400">
              0–48 Hour Forecast Timeline Slider
            </p>
          </div>
        </div>

        {/* Forecast Timestamp Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Offset:</span>
            <span className="font-bold text-cyan-300">+{offsetHours} hrs</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200">
              {forecastDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              {forecastDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 transition ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Animate"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onOffsetChange(0);
              }}
              title="Reset to Departure (T+0)"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider track */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={48}
          step={1}
          value={offsetHours}
          onChange={(e) => {
            setIsPlaying(false);
            onOffsetChange(Number(e.target.value));
          }}
          className="w-full cursor-pointer"
        />

        {/* Milestone ticks */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 px-0.5">
          {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onOffsetChange(h);
              }}
              className={`hover:text-cyan-400 transition ${
                offsetHours === h ? "text-cyan-400 font-bold" : ""
              }`}
            >
              +{h}h
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

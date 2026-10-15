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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-lg text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
            <CloudLightning className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 leading-tight">
              Trip Corridor Weather Heatmap
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              0–48h Forecast Timeline
            </p>
          </div>
        </div>

        {/* Forecast Timestamp Badge & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs font-mono text-slate-700">
            <Clock className="w-3 h-3 text-teal-600 shrink-0" />
            <span className="font-bold text-teal-700">+{offsetHours}h</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-medium truncate max-w-[120px] sm:max-w-none">
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
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2 py-1 rounded-xl border text-[11px] sm:text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
                isPlaying
                  ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                  : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 font-medium"
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onOffsetChange(0);
              }}
              title="Reset to Departure (T+0)"
              className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider track */}
      <div className="space-y-1">
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
          className="w-full cursor-pointer accent-teal-700 h-2"
        />

        {/* Milestone ticks */}
        <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-400 px-0.5">
          {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onOffsetChange(h);
              }}
              className={`hover:text-teal-700 transition cursor-pointer ${
                offsetHours === h ? "text-teal-700 font-bold" : ""
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

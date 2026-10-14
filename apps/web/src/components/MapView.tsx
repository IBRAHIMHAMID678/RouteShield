import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { RouteOption, Checkpoint, CorridorGridCell } from "../types";
import { Wind, CloudRain, Snowflake, AlertTriangle, Clock, MapPin } from "lucide-react";

interface Props {
  routes: RouteOption[];
  activeRouteId: string;
  corridorGrid: CorridorGridCell[];
  onSelectCheckpoint?: (chk: Checkpoint) => void;
}

export const MapView: React.FC<Props> = ({
  routes,
  activeRouteId,
  corridorGrid,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    routesGroup: L.LayerGroup;
    checkpointsGroup: L.LayerGroup;
    heatmapGroup: L.LayerGroup;
  }>({
    routesGroup: L.layerGroup(),
    checkpointsGroup: L.layerGroup(),
    heatmapGroup: L.layerGroup(),
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [39.8283, -98.5795], // Center of US
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap Humanitarian (HOT): Free, no API key required, clear terrain & road networks
    L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team",
      }
    ).addTo(map);

    layersRef.current.heatmapGroup.addTo(map);
    layersRef.current.routesGroup.addTo(map);
    layersRef.current.checkpointsGroup.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Routes and Checkpoints when routes or activeRouteId change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || routes.length === 0) return;

    layersRef.current.routesGroup.clearLayers();
    layersRef.current.checkpointsGroup.clearLayers();

    const activeRoute = routes.find((r) => r.route_id === activeRouteId) || routes[0];

    // 1. Draw all routes
    routes.forEach((r) => {
      const isSelected = r.route_id === activeRoute.route_id;
      const coords = r.geometry_geojson.coordinates.map((c) => [c[1], c[0]] as [number, number]);

      if (!isSelected) {
        // Inactive route: muted background line
        const polyline = L.polyline(coords, {
          color: "#475569",
          weight: 4,
          opacity: 0.5,
          dashArray: "4, 6",
        });
        polyline.bindTooltip(r.route_name, { sticky: true });
        layersRef.current.routesGroup.addLayer(polyline);
      } else {
        // Active route: colored segments according to Spotter risk thresholds
        if (r.risk_segments && r.risk_segments.length > 0) {
          r.risk_segments.forEach((seg) => {
            const segCoords: [number, number][] = [
              [seg.start_point[1], seg.start_point[0]],
              [seg.end_point[1], seg.end_point[0]],
            ];
            const segLine = L.polyline(segCoords, {
              color: seg.risk_color,
              weight: 6,
              opacity: 0.95,
            });
            segLine.bindTooltip(
              `Segment: ${seg.distance_miles.toFixed(1)} mi | Risk: ${seg.risk_label}`,
              { sticky: true }
            );
            layersRef.current.routesGroup.addLayer(segLine);
          });
        } else {
          const mainLine = L.polyline(coords, {
            color: "#10b981",
            weight: 6,
            opacity: 0.9,
          });
          layersRef.current.routesGroup.addLayer(mainLine);
        }
      }
    });

    // 2. Draw Checkpoints for the active route
    if (activeRoute && activeRoute.checkpoints) {
      activeRoute.checkpoints.forEach((chk, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === activeRoute.checkpoints.length - 1;
        const riskLevel = chk.risk?.level || 1;
        const markerColor = chk.risk?.level_color || "#10b981";

        const circleMarker = L.circleMarker([chk.latitude, chk.longitude], {
          radius: isFirst || isLast ? 8 : 6,
          fillColor: markerColor,
          color: "#0f172a",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        });

        // Rich HTML Popup HUD
        const popupHtml = `
          <div style="font-family: Inter, sans-serif; min-width: 210px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 700; color: #f8fafc; font-size: 13px;">
                ${isFirst ? "🏁 Origin" : isLast ? "📍 Destination" : `Checkpoint #${idx}`}
              </span>
              <span style="font-size: 11px; font-family: monospace; background: ${markerColor}22; color: ${markerColor}; border: 1px solid ${markerColor}66; border-radius: 4px; padding: 1px 6px; font-weight: bold;">
                ${chk.risk?.level_label || "Low"}
              </span>
            </div>

            <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-bottom: 6px;">
              <div>Mile: <b>${chk.distance_from_origin_miles.toFixed(1)} mi</b></div>
              <div>ETA: <b>${new Date(chk.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</b></div>
            </div>

            ${chk.weather ? `
              <div style="background: #1e293b88; border-radius: 6px; padding: 6px 8px; font-size: 11px; margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span style="color: #cbd5e1;">💨 Wind:</span>
                  <span style="font-weight: bold; color: #f8fafc;">${chk.weather.wind_mph.toFixed(1)} mph</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span style="color: #cbd5e1;">🌧️ Rain:</span>
                  <span style="font-weight: bold; color: #f8fafc;">${chk.weather.rain_in_per_hr.toFixed(2)} in/hr</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #cbd5e1;">❄️ Snow:</span>
                  <span style="font-weight: bold; color: #f8fafc;">${chk.weather.snow_in_per_hr.toFixed(2)} in/hr</span>
                </div>
              </div>
            ` : '<div style="color: #ef4444; font-size: 11px;">⚠️ Weather unavailable</div>'}

            ${chk.risk?.reasons && chk.risk.reasons.length > 0 ? `
              <div style="font-size: 10px; color: #cbd5e1; border-top: 1px dashed #334155; padding-top: 4px;">
                ${chk.risk.reasons[chk.risk.reasons.length - 1]}
              </div>
            ` : ""}
          </div>
        `;

        circleMarker.bindPopup(popupHtml);
        layersRef.current.checkpointsGroup.addLayer(circleMarker);
      });

      // Fit map to active route coordinates
      const activeCoords = activeRoute.geometry_geojson.coordinates.map((c) => [c[1], c[0]] as [number, number]);
      if (activeCoords.length > 0) {
        map.fitBounds(L.latLngBounds(activeCoords), { padding: [40, 40] });
      }
    }
  }, [routes, activeRouteId]);

  // Update Corridor Heatmap Grid when corridorGrid changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.heatmapGroup.clearLayers();

    if (corridorGrid && corridorGrid.length > 0) {
      corridorGrid.forEach((cell) => {
        // Color by intensity: 1 (green) .. 5 (dark red)
        let color = "#10b981";
        let fillOpacity = 0.25;

        if (cell.intensity === 5) {
          color = "#991b1b";
          fillOpacity = 0.55;
        } else if (cell.intensity === 4) {
          color = "#ef4444";
          fillOpacity = 0.45;
        } else if (cell.intensity === 3) {
          color = "#f97316";
          fillOpacity = 0.35;
        } else if (cell.intensity === 2) {
          color = "#f59e0b";
          fillOpacity = 0.3;
        }

        const circle = L.circle([cell.latitude, cell.longitude], {
          radius: 28000, // ~17 miles radius heat bubble
          color: "transparent",
          fillColor: color,
          fillOpacity: fillOpacity,
        });

        circle.bindTooltip(
          `Corridor Weather (+${cell.offset_hours}h): Wind ${cell.wind_mph.toFixed(0)}mph | Rain ${cell.rain_in_per_hr.toFixed(2)}in/h`,
          { sticky: true }
        );

        layersRef.current.heatmapGroup.addLayer(circle);
      });
    }
  }, [corridorGrid]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] glass-panel px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono shadow-xl flex items-center gap-3">
        <span className="text-slate-400 font-semibold">Risk:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span>Mod</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span>Severe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]" />
          <span>No Travel</span>
        </div>
      </div>
    </div>
  );
};

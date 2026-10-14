export interface WeatherObservation {
  wind_mph: number;
  rain_in_per_hr: number;
  snow_in_per_hr: number;
}

export interface RiskResult {
  level: number; // 1..5
  level_label: string; // 'Low' | 'Moderate' | 'High' | 'Severe' | 'No Travel'
  level_color: string;
  wind_level: number;
  rain_level: number;
  snow_level: number;
  score: number;
  reasons: string[];
}

export interface Checkpoint {
  checkpoint_id: string;
  latitude: number;
  longitude: number;
  distance_from_origin_miles: number;
  segment_miles: number;
  eta: string;
  weather: WeatherObservation | null;
  risk: RiskResult | null;
  weather_available: boolean;
}

export interface RouteSegmentRisk {
  segment_id: string;
  start_point: [number, number]; // [lon, lat]
  end_point: [number, number];   // [lon, lat]
  distance_miles: number;
  risk_level_value: number;
  risk_label: string;
  risk_color: string;
}

export interface RouteOption {
  route_id: string;
  route_name: string;
  summary_description: string;
  total_distance_miles: number;
  total_duration_hours: number;
  departure_time: string;
  arrival_time: string;
  geometry_geojson: {
    type: "LineString";
    coordinates: [number, number][]; // [lon, lat]
  };
  checkpoints: Checkpoint[];
  risk_segments: RouteSegmentRisk[];
  severe_miles: number;
  high_miles: number;
  moderate_miles: number;
  low_miles: number;
  no_travel_miles: number;
  average_risk_score: number;
  is_eligible: boolean;
  is_recommended: boolean;
  recommendation_rank: number;
  recommendation_reasons: string[];
}

export interface CorridorGridCell {
  latitude: number;
  longitude: number;
  wind_mph: number;
  rain_in_per_hr: number;
  snow_in_per_hr: number;
  intensity: number; // 1..5
  offset_hours: number;
}

export interface RoutePlanRequest {
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
  origin_name?: string;
  dest_name?: string;
  departure_time: string;
  load_weight_lb: number;
  sampling_interval_miles: number;
}

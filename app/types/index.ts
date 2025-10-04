// Core data types for resQ Forecast application

export interface Location {
  lat: number;
  lon: number;
  place_name?: string;
}

export interface BBox {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export type WeatherVariable = 'precipitation' | 'temperature' | 'wind_speed' | 'humidity' | 'cloud_cover';

export interface BasePeriod {
  start_year: number;
  end_year: number;
}

export interface ForecastRequest {
  lat: number;
  lon: number;
  day_of_year: number;
  window_days?: number; // default 3
  variable: WeatherVariable;
  threshold?: number | null;
  baseline_period: BasePeriod;
  recent_period: BasePeriod;
}

export interface Percentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export interface TrendData {
  slope: number;
  p_value: number;
  method: string; // e.g. "Mann-Kendall + Sen's slope"
}

export interface BaselineComparison {
  p_exceed_baseline: number;
  p_exceed_recent: number;
  delta_percent: number;
}

export interface DataSource {
  dataset: string;
  url: string;
  doi?: string;
  resolution: string;
}

export interface TimeSeriesPoint {
  year: number;
  value: number;
}

export interface StatisticsResponse {
  variable: WeatherVariable;
  units: string;
  n_years: number;
  mean: number;
  median: number;
  std: number;
  percentiles: Percentiles;
  p_exceed?: number; // probability of exceeding threshold
  p_exceed_CI?: [number, number]; // confidence interval
  trend?: TrendData;
  baseline_vs_recent?: BaselineComparison;
  source: DataSource[];
  time_series: TimeSeriesPoint[];
  caveats?: string;
}

export interface UserProfile {
  age_group?: string;
  activity_type?: 'picnic' | 'hike' | 'parade' | 'outdoor_event' | 'other';
}

export interface AIQueryRequest {
  user_query: string;
  location: Location;
  day_of_year: number;
  window_days?: number;
  variables: WeatherVariable[];
  thresholds?: Record<WeatherVariable, number>;
  user_profile?: UserProfile;
  language?: string; // default 'en'
}

export interface AIQueryResponse {
  answer: string; // user-friendly short answer
  explanation: string; // technical explanation with probabilities
  recommended_actions: string[]; // action items
  confidence_score: number; // 0-1
  sources: DataSource[];
  downloadable?: {
    csv_url?: string;
    json_url?: string;
    geotiff_url?: string;
  };
}

export interface MapState {
  center: [number, number]; // [lat, lon]
  zoom: number;
  pins: Location[];
  selectedPin?: Location;
}

export interface ForecastState {
  location?: Location;
  day_of_year: number;
  window_days: number;
  variable: WeatherVariable;
  threshold?: number;
  baseline_period: BasePeriod;
  recent_period: BasePeriod;
  statistics?: StatisticsResponse;
  loading: boolean;
  error?: string;
}

export interface AIState {
  query: string;
  response?: AIQueryResponse;
  loading: boolean;
  error?: string;
}

// Export formats
export type ExportFormat = 'csv' | 'json' | 'geotiff';

// Chart data types
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

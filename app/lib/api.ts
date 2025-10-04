// API client utilities for resQ backend

import type {
  ForecastRequest,
  StatisticsResponse,
  AIQueryRequest,
  AIQueryResponse,
} from '@/app/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch forecast statistics for a given location and parameters
 */
export async function fetchForecastStatistics(
  request: ForecastRequest
): Promise<StatisticsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/forecast/statistics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Query AI assistant with context about location and weather parameters
 */
export async function queryAI(
  request: AIQueryRequest
): Promise<AIQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ai/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch map tiles or probability raster data
 */
export async function fetchMapData(params: {
  variable: string;
  threshold?: number;
  date?: string;
  bbox?: string;
}): Promise<any> {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString();

  const response = await fetch(`${API_BASE_URL}/api/forecast/map?${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.status}`);
  }

  return response.json();
}

/**
 * Request export file generation (CSV/JSON/GeoTIFF)
 */
export async function requestExport(params: {
  format: 'csv' | 'json' | 'geotiff';
  data: any;
}): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/api/export/${params.format}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

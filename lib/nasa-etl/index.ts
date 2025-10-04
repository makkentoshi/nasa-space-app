/**
 * NASA ETL Pipeline - Main Export
 */

export * from './config'
export * from './fetcher'
export * from './processor'
export * from './orchestrator'

import { ETLJob, NASAETLOrchestrator } from './orchestrator'
import { DEFAULT_ETL_CONFIG, DatasetKey } from './config'

/**
 * Create ETL job with simplified configuration
 */
export function createETLJob(config: {
  id: string
  name: string
  description: string
  dataset: DatasetKey
  variables: string[]
  location: { lat: number; lon: number } | {
    bounds: { north: number; south: number; east: number; west: number }
  }
  dateRange: { start: string; end: string }
  outputFormat?: 'json' | 'csv' | 'netcdf'
}): ETLJob {
  const spatial = 'lat' in config.location
    ? { lat: config.location.lat, lon: config.location.lon }
    : { bounds: config.location.bounds }

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    dataset: config.dataset,
    variables: config.variables,
    spatial,
    temporal: {
      start: config.dateRange.start,
      end: config.dateRange.end
    },
    processing: {
      quality_control: true,
      outlier_detection: true,
      gap_filling: true,
      output_format: config.outputFormat || 'json'
    }
  }
}

/**
 * Create orchestrator with authentication
 */
export async function createAuthenticatedOrchestrator(
  earthdataCredentials?: { username: string; password: string }
): Promise<NASAETLOrchestrator> {
  const orchestrator = new NASAETLOrchestrator(DEFAULT_ETL_CONFIG)
  
  if (earthdataCredentials) {
    await orchestrator.authenticate(
      earthdataCredentials.username,
      earthdataCredentials.password
    )
  }
  
  return orchestrator
}

// Pre-configured job templates
export const JOB_TEMPLATES = {
  eventPrecipitationForecast: (location: { lat: number; lon: number }, days: number = 7) =>
    createETLJob({
      id: `precip_forecast_${location.lat}_${location.lon}_${Date.now()}`,
      name: 'Event Precipitation Forecast',
      description: 'Daily precipitation data for event planning',
      dataset: 'gpm_imerg',
      variables: ['precipitation'],
      location,
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      outputFormat: 'json'
    }),

  comprehensiveWeatherAnalysis: (location: { lat: number; lon: number }, dateRange: { start: string; end: string }) =>
    createETLJob({
      id: `weather_analysis_${location.lat}_${location.lon}_${Date.now()}`,
      name: 'Comprehensive Weather Analysis',
      description: 'Multi-variable weather analysis using NASA POWER data',
      dataset: 'nasa_power',
      variables: ['T2M', 'RH2M', 'PRECTOTCORR', 'WS10M'],
      location,
      dateRange,
      outputFormat: 'json'
    }),

  regionalDisasterMonitoring: (bounds: { north: number; south: number; east: number; west: number }) =>
    createETLJob({
      id: `disaster_monitor_${Date.now()}`,
      name: 'Regional Disaster Monitoring',
      description: 'Track natural events and disasters using EONET',
      dataset: 'eonet',
      variables: ['events'],
      location: { bounds },
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      outputFormat: 'json'
    })
}

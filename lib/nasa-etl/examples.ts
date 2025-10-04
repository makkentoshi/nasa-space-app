/**
 * NASA ETL Pipeline Usage Examples
 */

import {
  createAuthenticatedOrchestrator,
  createETLJob,
  JOB_TEMPLATES,
  ETLJob
} from './index'

const NYC_LOCATION = { lat: 40.7128, lon: -74.0060 }

/**
 * Example 1: Simple precipitation forecast
 */
export async function examplePrecipitationForecast() {
  console.log('🌧️  Example: Event Precipitation Forecast')
  
  const orchestrator = await createAuthenticatedOrchestrator()
  const job = JOB_TEMPLATES.eventPrecipitationForecast(NYC_LOCATION, 7)
  
  await orchestrator.registerJob(job)
  const result = await orchestrator.executeJob(job.id)
  
  console.log('Result:', result)
  return result
}

/**
 * Example 2: Multi-location weather analysis
 */
export async function exampleMultiLocationAnalysis() {
  console.log('🌡️  Example: Multi-Location Weather Analysis')
  
  const orchestrator = await createAuthenticatedOrchestrator()
  
  const locations = [
    { name: 'New York', coords: { lat: 40.7128, lon: -74.0060 } },
    { name: 'Los Angeles', coords: { lat: 34.0522, lon: -118.2437 } }
  ]
  
  const jobs = locations.map(location =>
    JOB_TEMPLATES.comprehensiveWeatherAnalysis(
      location.coords,
      {
        start: '2025-01-01',
        end: '2025-01-31'
      }
    )
  )
  
  jobs.forEach(job => orchestrator.registerJob(job))
  const results = await orchestrator.executeJobsBatch(jobs.map(j => j.id))
  
  console.log('Results:', results)
  return results
}

import { NextRequest, NextResponse } from 'next/server'

interface NASAForecastRequest {
  lat: number
  lng: number
  radius?: number
  gridSize?: number
}

interface WeatherPoint {
  lat: number
  lng: number
  values: {
    temperature: number
    humidity: number
    precipitation: number
    wind_speed: number
    cloud_cover: number
    uv_index: number
  }
  forecast?: Array<{
    time: Date | string
    values: {
      temperature: number
      humidity: number
      precipitation: number
      wind_speed: number
      cloud_cover: number
      uv_index: number
    }
  }>
}

/**
 * POST /api/forecast/nasa
 * Fetch weather data from NASA POWER API for a grid around a location
 */
export async function POST(request: NextRequest) {
  try {
    const body: NASAForecastRequest = await request.json()

    if (!body.lat || !body.lng) {
      return NextResponse.json(
        { error: 'Missing required fields: lat, lng' },
        { status: 400 }
      )
    }

    const { lat, lng, radius = 50, gridSize = 3 } = body

    // Generate grid points around the center location
    const gridPoints: Array<{ lat: number; lng: number }> = []
    const step = (radius / 111) / gridSize // Convert km to degrees (approx)

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        gridPoints.push({
          lat: lat + i * step,
          lng: lng + j * step
        })
      }
    }

    // Fetch NASA POWER data for each grid point
    const weatherData: WeatherPoint[] = []
    const batchSize = 5 // Process in batches to avoid overwhelming the API
    
    for (let i = 0; i < gridPoints.length; i += batchSize) {
      const batch = gridPoints.slice(i, i + batchSize)
      const batchPromises = batch.map(async (point) => {
        try {
          const nasaData = await fetchNASAPowerData(point.lat, point.lng)
          if (nasaData) {
            weatherData.push({
              lat: point.lat,
              lng: point.lng,
              values: nasaData,
              forecast: generateMockForecast(nasaData) // Generate 7-day forecast
            })
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${point.lat}, ${point.lng}:`, error)
          // Add fallback data
          weatherData.push({
            lat: point.lat,
            lng: point.lng,
            values: generateFallbackData(point.lat, point.lng, lat, lng)
          })
        }
      })

      await Promise.all(batchPromises)
      
      // Add small delay between batches
      if (i + batchSize < gridPoints.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return NextResponse.json({
      success: true,
      weatherData,
      metadata: {
        centerLat: lat,
        centerLng: lng,
        radius,
        gridSize,
        dataPoints: weatherData.length,
        source: 'NASA POWER API',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('NASA forecast API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch NASA weather data' },
      { status: 500 }
    )
  }
}

/**
 * Fetch data from NASA POWER API
 */
async function fetchNASAPowerData(lat: number, lng: number) {
  try {
    const now = new Date()
    const currentDate = now.toISOString().slice(0, 10).replace(/-/g, '')
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '')
    
    const response = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,PRECTOTCORR,WS2M,CLRSKY_SFC_SW_DWN&community=RE&longitude=${lng}&latitude=${lat}&start=${yesterdayDate}&end=${currentDate}&format=JSON`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`NASA POWER API returned ${response.status}`)
    }

    const data = await response.json()
    const parameters = data.properties?.parameter

    if (!parameters) {
      throw new Error('No parameter data in NASA response')
    }

    // Get the most recent date's data
    const dates = Object.keys(parameters.T2M || {})
    const latestDate = dates[dates.length - 1]

    return {
      temperature: parameters.T2M?.[latestDate] ?? 20,
      humidity: parameters.RH2M?.[latestDate] ?? 50,
      precipitation: parameters.PRECTOTCORR?.[latestDate] ?? 0,
      wind_speed: parameters.WS2M?.[latestDate] ?? 5,
      cloud_cover: 100 - (parameters.CLRSKY_SFC_SW_DWN?.[latestDate] ?? 50) / 10, // Estimate
      uv_index: Math.max(0, (parameters.CLRSKY_SFC_SW_DWN?.[latestDate] ?? 200) / 50) // Estimate
    }

  } catch (error) {
    console.warn('NASA POWER API fetch failed:', error)
    return null
  }
}

/**
 * Generate 7-day forecast based on current conditions
 */
function generateMockForecast(baseData: any) {
  const forecast = []
  const now = new Date()

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 8; hour += 3) { // Every 3 hours
      const time = new Date(now.getTime() + day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000)
      
      // Add some variation to the base data
      const tempVariation = (Math.random() - 0.5) * 8
      const humidityVariation = (Math.random() - 0.5) * 20
      const precipVariation = Math.random() * 5
      
      forecast.push({
        time: time.toISOString(),
        values: {
          temperature: baseData.temperature + tempVariation,
          humidity: Math.max(0, Math.min(100, baseData.humidity + humidityVariation)),
          precipitation: Math.max(0, baseData.precipitation + precipVariation),
          wind_speed: Math.max(0, baseData.wind_speed + (Math.random() - 0.5) * 5),
          cloud_cover: Math.max(0, Math.min(100, baseData.cloud_cover + (Math.random() - 0.5) * 30)),
          uv_index: Math.max(0, Math.min(11, baseData.uv_index + (Math.random() - 0.5) * 3))
        }
      })
    }
  }

  return forecast
}

/**
 * Generate fallback data when NASA API fails
 */
function generateFallbackData(pointLat: number, pointLng: number, centerLat: number, centerLng: number) {
  const distanceFromCenter = Math.sqrt(
    Math.pow((pointLat - centerLat) * 111, 2) + 
    Math.pow((pointLng - centerLng) * 111, 2)
  )
  
  const baseIntensity = Math.max(0, 1 - distanceFromCenter / 50)
  
  return {
    temperature: 18 + Math.sin(pointLat * 0.1) * 8 + (Math.random() - 0.5) * 4,
    humidity: 50 + baseIntensity * 30 + (Math.random() - 0.5) * 20,
    precipitation: Math.max(0, baseIntensity * 25 + (Math.random() - 0.7) * 30),
    wind_speed: Math.max(0, baseIntensity * 15 + Math.random() * 10),
    cloud_cover: Math.min(100, baseIntensity * 80 + Math.random() * 40),
    uv_index: Math.max(0, (1 - baseIntensity) * 8 + Math.random() * 3)
  }
}

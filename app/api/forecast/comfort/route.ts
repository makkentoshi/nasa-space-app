import { NextRequest, NextResponse } from 'next/server'

interface WeatherData {
  temperature: number // in Fahrenheit
  humidity: number // percentage
  windSpeed: number // mph
  uvIndex: number // 0-11 scale
  pressure: number // inches of mercury
  precipitation: number // inches
}

interface ComfortFactors {
  temperature: number
  humidity: number
  wind: number
  uv: number
  weather: number
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, weatherData, userPreferences } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Default weather data if not provided
    const weather: WeatherData = weatherData || {
      temperature: 72,
      humidity: 50,
      windSpeed: 8,
      uvIndex: 5,
      pressure: 30.0,
      precipitation: 0
    }

    // Default user preferences
    const prefs = userPreferences || {
      idealTemp: 72,
      tempTolerance: 10,
      humidityTolerance: 20,
      windTolerance: 15,
      uvSensitivity: 'medium'
    }

    // Calculate comfort factors (0-10 scale for each)
    const factors = calculateComfortFactors(weather, prefs)
    
    // Calculate overall comfort index (weighted average)
    const weights = {
      temperature: 0.35,
      humidity: 0.25,
      wind: 0.20,
      uv: 0.15,
      weather: 0.05
    }

    const comfortIndex = Math.round(
      factors.temperature * weights.temperature +
      factors.humidity * weights.humidity +
      factors.wind * weights.wind +
      factors.uv * weights.uv +
      factors.weather * weights.weather
    )

    // Generate comfort advice
    const advice = generateComfortAdvice(comfortIndex, factors, weather)
    
    // Get comfort level and color
    const level = getComfortLevel(comfortIndex)
    const color = getComfortColor(comfortIndex)

    return NextResponse.json({
      success: true,
      comfortIndex,
      level,
      color,
      factors,
      advice,
      weather,
      location: { lat, lng },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Comfort Index API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate comfort index' },
      { status: 500 }
    )
  }
}

function calculateComfortFactors(weather: WeatherData, prefs: any): ComfortFactors {
  // Temperature comfort (0-10)
  const tempDiff = Math.abs(weather.temperature - prefs.idealTemp)
  const tempComfort = Math.max(0, 10 - (tempDiff / prefs.tempTolerance) * 10)

  // Humidity comfort (0-10) - ideal range 40-60%
  let humidityComfort = 10
  if (weather.humidity < 30 || weather.humidity > 70) {
    const deviation = weather.humidity < 30 ? 30 - weather.humidity : weather.humidity - 70
    humidityComfort = Math.max(0, 10 - (deviation / 20) * 10)
  } else if (weather.humidity < 40 || weather.humidity > 60) {
    const deviation = weather.humidity < 40 ? 40 - weather.humidity : weather.humidity - 60
    humidityComfort = Math.max(5, 10 - (deviation / 10) * 5)
  }

  // Wind comfort (0-10) - gentle breeze is ideal
  let windComfort = 10
  if (weather.windSpeed > 15) {
    windComfort = Math.max(0, 10 - ((weather.windSpeed - 15) / 10) * 8)
  } else if (weather.windSpeed < 3) {
    windComfort = 8 // slight reduction for no breeze
  }

  // UV comfort (0-10) - based on safety
  let uvComfort = 10
  const uvSensitivity = prefs.uvSensitivity || 'medium'
  const uvThresholds: Record<string, { moderate: number; high: number; extreme: number }> = {
    low: { moderate: 6, high: 8, extreme: 10 },
    medium: { moderate: 4, high: 6, extreme: 8 },
    high: { moderate: 3, high: 5, extreme: 7 }
  }
  
  const thresholds = uvThresholds[uvSensitivity] || uvThresholds.medium
  if (weather.uvIndex >= thresholds.extreme) {
    uvComfort = 2
  } else if (weather.uvIndex >= thresholds.high) {
    uvComfort = 5
  } else if (weather.uvIndex >= thresholds.moderate) {
    uvComfort = 8
  }

  // Weather conditions comfort (0-10)
  let weatherComfort = 10
  if (weather.precipitation > 0.1) {
    weatherComfort = Math.max(3, 10 - (weather.precipitation * 10))
  }

  return {
    temperature: Math.round(tempComfort),
    humidity: Math.round(humidityComfort),
    wind: Math.round(windComfort),
    uv: Math.round(uvComfort),
    weather: Math.round(weatherComfort)
  }
}

function generateComfortAdvice(index: number, factors: ComfortFactors, weather: WeatherData): string[] {
  const advice: string[] = []

  if (index >= 8) {
    advice.push("Perfect conditions for outdoor activities!")
  } else if (index >= 6) {
    advice.push("Good conditions with minor considerations.")
  } else if (index >= 4) {
    advice.push("Moderate conditions - prepare accordingly.")
  } else {
    advice.push("Challenging conditions - take extra precautions.")
  }

  // Temperature advice
  if (factors.temperature <= 5) {
    if (weather.temperature > 85) {
      advice.push("Very hot - stay hydrated and seek shade frequently.")
    } else if (weather.temperature < 50) {
      advice.push("Cold conditions - dress warmly in layers.")
    }
  }

  // Humidity advice
  if (factors.humidity <= 5) {
    if (weather.humidity > 70) {
      advice.push("High humidity - you may feel warmer than the actual temperature.")
    } else if (weather.humidity < 30) {
      advice.push("Low humidity - stay hydrated and consider moisturizer.")
    }
  }

  // Wind advice
  if (factors.wind <= 5) {
    advice.push("Strong winds expected - secure loose items and be cautious outdoors.")
  }

  // UV advice
  if (factors.uv <= 5) {
    advice.push("High UV levels - wear sunscreen and protective clothing.")
  }

  // Weather advice
  if (factors.weather <= 5) {
    advice.push("Precipitation expected - bring rain protection.")
  }

  return advice
}

function getComfortLevel(index: number): string {
  if (index >= 9) return 'Excellent'
  if (index >= 7) return 'Very Comfortable'
  if (index >= 5) return 'Comfortable'
  if (index >= 3) return 'Moderate'
  if (index >= 1) return 'Uncomfortable'
  return 'Poor'
}

function getComfortColor(index: number): string {
  if (index >= 8) return 'green'
  if (index >= 6) return 'blue'
  if (index >= 4) return 'yellow'
  if (index >= 2) return 'orange'
  return 'red'
}
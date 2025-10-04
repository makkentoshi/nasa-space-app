import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface WeatherInsightRequest {
  location: {
    lat: number
    lng: number
    name?: string
  }
  type?: 'temperature' | 'precipitation' | 'general'
  context?: string
}

interface NASAWeatherData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  pressure: number
}

async function fetchRealTimeWeatherData(lat: number, lng: number): Promise<NASAWeatherData | null> {
  try {
    // Use Open-Meteo for real-time accurate weather data
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure&timezone=auto`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Open-Meteo API request failed')
    }
    
    const data = await response.json()
    const current = data.current

    if (!current) {
      return null
    }

    return {
      temperature: Math.round(current.temperature_2m ?? 20),
      humidity: Math.round(current.relative_humidity_2m ?? 60),
      precipitation: current.precipitation ?? 0,
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      pressure: Math.round(current.surface_pressure ?? 1013)
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}

async function generateWeatherInsight(
  location: WeatherInsightRequest['location'],
  nasaData: NASAWeatherData,
  type: string = 'general',
  context?: string
): Promise<string> {
  try {
    const systemPrompt = `You are an expert meteorologist analyzing real-time weather data. Provide concise, accurate insights about current conditions based on actual measurements. Focus on current conditions and practical recommendations.`
    
    const userPrompt = `
Location: ${location.name || `${location.lat}, ${location.lng}`}
Current Real-Time Weather Data:
- Current Temperature: ${nasaData.temperature}°C
- Current Humidity: ${nasaData.humidity}%
- Current Precipitation: ${nasaData.precipitation}mm
- Current Wind Speed: ${nasaData.windSpeed} km/h
- Current Pressure: ${nasaData.pressure} hPa

Analysis Type: ${type}
${context ? `Additional Context: ${context}` : ''}

Based on this real-time weather data, provide a brief insight about ${type === 'temperature' ? 'temperature conditions and comfort levels right now' : type === 'precipitation' ? 'current precipitation and weather conditions' : 'current weather conditions and practical recommendations'}. 

Keep it concise (2-3 sentences) and focus on what people should know right now.
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Unable to generate weather insight at this time.'
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Weather analysis temporarily unavailable. Please try again later.'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: WeatherInsightRequest = await request.json()
    const { location, type = 'general', context } = body

    if (!location?.lat || !location?.lng) {
      return NextResponse.json({ error: 'Location coordinates required' }, { status: 400 })
    }

    const weatherData = await fetchRealTimeWeatherData(location.lat, location.lng)
    
    if (!weatherData) {
      return NextResponse.json({ 
        error: 'Unable to fetch weather data',
        fallback: {
          insight: `Weather data temporarily unavailable for ${location.name || 'your location'}. Please try again later.`,
          confidence: 'low',
          type: type
        }
      }, { status: 500 })
    }
    
    const insight = await generateWeatherInsight(location, weatherData, type, context)

    const confidence = 'high' // Open-Meteo provides real-time accurate data

    const sanitizedData: NASAWeatherData = {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      precipitation: weatherData.precipitation,
      windSpeed: weatherData.windSpeed,
      pressure: weatherData.pressure
    }

    return NextResponse.json({
      insight,
      confidence,
      type,
      location: location.name || `${location.lat}, ${location.lng}`,
      nasaData: sanitizedData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Weather insight API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      fallback: {
        insight: 'Weather analysis service is temporarily unavailable.',
        confidence: 'low',
        type: 'general'
      }
    }, { status: 500 })
  }
}

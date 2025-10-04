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

async function fetchNASAData(lat: number, lng: number): Promise<NASAWeatherData | null> {
  try {
    const now = new Date()
    const currentDate = now.toISOString().slice(0, 10).replace(/-/g, '')
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '')
    
    const response = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,PRECTOTCORR,WS2M,PS&community=RE&longitude=${lng}&latitude=${lat}&start=${yesterdayDate}&end=${currentDate}&format=JSON`
    )
    
    if (!response.ok) {
      throw new Error('NASA API request failed')
    }
    
    const data = await response.json()
    const properties = data.properties?.parameter

    if (!properties) {
      return null
    }

    const latestData = Object.keys(properties.T2M || {}).pop()
    if (!latestData) return null

    const sanitize = (v: any, fallback: number) => {
      if (v === null || v === undefined) return fallback
      if (typeof v === 'number' && v <= -900) return fallback
      return v
    }

    return {
      temperature: sanitize(properties.T2M?.[latestData], 20),
      humidity: sanitize(properties.RH2M?.[latestData], 60),
      precipitation: sanitize(properties.PRECTOTCORR?.[latestData], 0),
      windSpeed: sanitize(properties.WS2M?.[latestData], 10),
      pressure: sanitize(properties.PS?.[latestData], 1013)
    }
  } catch (error) {
    console.error('NASA API error:', error)
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
    const systemPrompt = `You are an expert meteorologist analyzing NASA satellite data. Based on DAILY weather data, provide realistic insights about current conditions and general trends. DO NOT make specific hourly predictions since you only have daily data. Focus on current conditions and general daily trends.`
    
    const userPrompt = `
Location: ${location.name || `${location.lat}, ${location.lng}`}
Current NASA Daily Data:
- Daily Average Temperature: ${nasaData.temperature}°C
- Daily Average Humidity: ${nasaData.humidity}%
- Daily Precipitation Total: ${nasaData.precipitation}mm
- Daily Average Wind Speed: ${nasaData.windSpeed} m/s
- Daily Average Pressure: ${nasaData.pressure} hPa

Analysis Type: ${type}
${context ? `Additional Context: ${context}` : ''}

Based on this DAILY satellite data, provide insight about ${type === 'temperature' ? 'temperature conditions and comfort levels for today' : type === 'precipitation' ? 'precipitation patterns and current conditions' : 'general current weather conditions and recommendations for today'}. 

Important: Only describe current daily conditions and general trends. DO NOT predict specific future hours or give percentage chances for specific time periods.
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

    const nasaData = await fetchNASAData(location.lat, location.lng)
    
    if (!nasaData) {
      return NextResponse.json({ 
        error: 'Unable to fetch weather data',
        fallback: {
          insight: `Weather data temporarily unavailable for ${location.name || 'your location'}. Please try again later.`,
          confidence: 'low',
          type: type
        }
      }, { status: 500 })
    }
    
    const insight = await generateWeatherInsight(location, nasaData, type, context)

    const usedFallback = (nasaData.temperature === 20 || nasaData.humidity === 60 || nasaData.precipitation === 0 || nasaData.windSpeed === 10 || nasaData.pressure === 1013)
    const confidence = usedFallback ? 'medium' : 'high'

    const sanitizedData: NASAWeatherData = {
      temperature: nasaData.temperature,
      humidity: nasaData.humidity,
      precipitation: nasaData.precipitation,
      windSpeed: nasaData.windSpeed,
      pressure: nasaData.pressure
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

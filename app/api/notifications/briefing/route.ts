import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/notifications/briefing
 * Generate daily AI weather briefing with personalized recommendations
 * 
 * Query parameters:
 * - user_id: string (optional)
 * - lat: number
 * - lng: number
 * - date: string (YYYY-MM-DD, optional, defaults to today)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Generate comprehensive daily briefing
    const briefing = await generateDailyBriefing(user_id, lat, lng, date)

    return NextResponse.json(briefing)

  } catch (error: any) {
    console.error('Briefing API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate briefing' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/briefing
 * Schedule or send a daily briefing notification
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id, lat, lng, subscription, send_now } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const briefing = await generateDailyBriefing(user_id, lat, lng)

    if (send_now && subscription) {
      // Send push notification
      const notificationSent = await sendBriefingNotification(subscription, briefing)
      
      return NextResponse.json({
        success: true,
        notification_sent: notificationSent,
        briefing
      })
    }

    return NextResponse.json({
      success: true,
      briefing
    })

  } catch (error: any) {
    console.error('Briefing POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process briefing request' },
      { status: 500 }
    )
  }
}

async function generateDailyBriefing(
  user_id: string | null,
  lat: number,
  lng: number,
  date?: string
) {
  const today = date ? new Date(date) : new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })

  // Fetch weather data
  const weatherData = await fetchWeatherData(lat, lng)
  
  // Fetch user behavior predictions if user_id provided
  let behaviorPredictions = null
  if (user_id) {
    behaviorPredictions = await fetchBehaviorPredictions(user_id)
  }

  // Calculate comfort index
  const comfortIndex = calculateComfortIndex(weatherData)

  // Generate AI recommendations
  const aiRecommendations = generateAIRecommendations(
    weatherData, 
    comfortIndex, 
    behaviorPredictions
  )

  // Determine weather emoji
  const weatherEmoji = getWeatherEmoji(weatherData.conditions)

  // Build briefing
  const briefing = {
    meta: {
      generated_at: new Date().toISOString(),
      user_id,
      location: { lat, lng },
      date: today.toISOString().split('T')[0]
    },
    greeting: {
      title: `Good Morning! ${dayName}`,
      subtitle: formattedDate,
      emoji: '☀️'
    },
    weather_overview: {
      emoji: weatherEmoji,
      summary: weatherData.summary,
      high_temp: weatherData.high_temp,
      low_temp: weatherData.low_temp,
      conditions: weatherData.conditions,
      precipitation_chance: weatherData.precipitation_chance,
      wind_speed: weatherData.wind_speed,
      humidity: weatherData.humidity,
      uv_index: weatherData.uv_index
    },
    comfort_assessment: {
      index: comfortIndex,
      rating: getComfortRating(comfortIndex),
      description: getComfortDescription(comfortIndex),
      outdoor_recommendation: comfortIndex > 70 ? 'Great for outdoor activities!' : 
                               comfortIndex > 50 ? 'Moderate conditions for outdoor activities' :
                               'Indoor activities recommended'
    },
    ai_insights: {
      key_insight: aiRecommendations.key_insight,
      recommendations: aiRecommendations.recommendations,
      warnings: aiRecommendations.warnings,
      best_time_outdoor: aiRecommendations.best_time_outdoor
    },
    behavior_predictions: behaviorPredictions ? {
      route_alerts: behaviorPredictions.route_alerts,
      proactive_tips: behaviorPredictions.proactive_tips,
      schedule_optimization: behaviorPredictions.schedule_optimization
    } : null,
    hourly_forecast: generateHourlyHighlights(weatherData),
    action_items: [
      ...aiRecommendations.action_items,
      ...(behaviorPredictions?.action_items || [])
    ],
    notification: {
      title: `${weatherEmoji} ${dayName} Weather Briefing`,
      body: `${weatherData.conditions} • H: ${weatherData.high_temp}° L: ${weatherData.low_temp}° • ${aiRecommendations.key_insight}`,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-96.svg'
    }
  }

  return briefing
}

async function fetchWeatherData(lat: number, lng: number) {
  // Mock weather data - in production, fetch from NASA POWER API or OpenWeather
  const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny']
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
  
  return {
    conditions: randomCondition,
    summary: `${randomCondition} skies expected throughout the day`,
    high_temp: Math.floor(75 + Math.random() * 15),
    low_temp: Math.floor(55 + Math.random() * 10),
    precipitation_chance: Math.floor(Math.random() * 40),
    wind_speed: Math.floor(5 + Math.random() * 15),
    humidity: Math.floor(40 + Math.random() * 40),
    uv_index: Math.floor(1 + Math.random() * 10),
    sunrise: '06:45 AM',
    sunset: '07:30 PM',
    hourly: generateMockHourlyData()
  }
}

function generateMockHourlyData() {
  const hours = []
  const baseTemp = 65
  
  for (let i = 0; i < 24; i++) {
    const hour = i
    const temp = baseTemp + Math.sin((i - 6) * Math.PI / 12) * 10
    
    hours.push({
      hour: `${hour}:00`,
      temp: Math.round(temp),
      precipitation_chance: Math.floor(Math.random() * 30),
      conditions: i >= 6 && i <= 18 ? 'Clear' : 'Partly Cloudy'
    })
  }
  
  return hours
}

async function fetchBehaviorPredictions(user_id: string) {
  // Mock behavior predictions - in production, fetch from /api/forecast/behavior
  return {
    route_alerts: [
      {
        route: 'Home → Work',
        time: '08:00 AM',
        weather_impact: 'Light traffic due to good weather',
        recommendation: 'Perfect conditions for your morning commute'
      }
    ],
    proactive_tips: [
      'Leave 5 minutes earlier to enjoy cooler morning temperatures',
      'Good day for outdoor lunch break'
    ],
    schedule_optimization: 'Optimal time for outdoor activities: 10 AM - 4 PM',
    action_items: [
      'Check route before leaving at 8:00 AM',
      'Pack sunglasses - high UV index expected'
    ]
  }
}

function calculateComfortIndex(weatherData: any): number {
  // Simple comfort index calculation
  const tempScore = 100 - Math.abs(weatherData.high_temp - 72) * 2
  const precipScore = 100 - weatherData.precipitation_chance
  const windScore = Math.max(0, 100 - weatherData.wind_speed * 3)
  const humidityScore = 100 - Math.abs(weatherData.humidity - 50)
  
  return Math.round((tempScore + precipScore + windScore + humidityScore) / 4)
}

function getComfortRating(index: number): string {
  if (index >= 80) return 'Excellent'
  if (index >= 70) return 'Very Good'
  if (index >= 60) return 'Good'
  if (index >= 50) return 'Fair'
  if (index >= 40) return 'Poor'
  return 'Very Poor'
}

function getComfortDescription(index: number): string {
  if (index >= 80) return 'Perfect weather conditions for any outdoor activity'
  if (index >= 70) return 'Great weather with comfortable temperatures'
  if (index >= 60) return 'Pleasant conditions with minor considerations'
  if (index >= 50) return 'Acceptable weather but plan accordingly'
  if (index >= 40) return 'Challenging conditions - indoor activities preferred'
  return 'Difficult weather conditions - stay indoors'
}

function generateAIRecommendations(
  weatherData: any,
  comfortIndex: number,
  behaviorPredictions: any
) {
  const recommendations = []
  const warnings = []
  const action_items = []

  // Temperature-based recommendations
  if (weatherData.high_temp > 85) {
    recommendations.push('Stay hydrated throughout the day')
    action_items.push('Bring water bottle')
    warnings.push('High temperatures - limit outdoor exposure during peak hours')
  } else if (weatherData.high_temp < 50) {
    recommendations.push('Dress in layers for varying temperatures')
    action_items.push('Wear warm jacket')
  }

  // Precipitation recommendations
  if (weatherData.precipitation_chance > 50) {
    recommendations.push('Keep umbrella handy')
    action_items.push('Pack rain gear')
    warnings.push('High chance of rain - plan indoor alternatives')
  } else if (weatherData.precipitation_chance > 30) {
    recommendations.push('Slight chance of rain - be prepared')
  }

  // UV recommendations
  if (weatherData.uv_index > 7) {
    recommendations.push('Use sunscreen SPF 30+ if going outside')
    action_items.push('Apply sunscreen')
    warnings.push('Very high UV index - protect your skin')
  }

  // Wind recommendations
  if (weatherData.wind_speed > 20) {
    recommendations.push('Secure loose outdoor items')
    warnings.push('Strong winds expected - use caution')
  }

  // Key insight generation
  let key_insight = ''
  if (comfortIndex >= 80) {
    key_insight = 'Perfect day for outdoor activities and exercise!'
  } else if (comfortIndex >= 70) {
    key_insight = 'Great weather - enjoy being outside today'
  } else if (comfortIndex >= 60) {
    key_insight = 'Pleasant conditions with some minor considerations'
  } else if (comfortIndex < 50) {
    key_insight = 'Challenging weather - plan accordingly'
  }

  // Best outdoor time
  const best_time_outdoor = weatherData.high_temp > 85 
    ? 'Morning (before 10 AM) or evening (after 5 PM)'
    : weatherData.high_temp < 50
    ? 'Midday (11 AM - 2 PM) when temperatures peak'
    : 'All day - consistent comfortable conditions'

  return {
    key_insight,
    recommendations,
    warnings,
    best_time_outdoor,
    action_items
  }
}

function generateHourlyHighlights(weatherData: any) {
  return [
    {
      time: '8:00 AM',
      temp: weatherData.low_temp + 5,
      highlight: 'Morning commute - cool and comfortable'
    },
    {
      time: '12:00 PM',
      temp: Math.round((weatherData.high_temp + weatherData.low_temp) / 2),
      highlight: 'Lunch time - temperatures warming up'
    },
    {
      time: '3:00 PM',
      temp: weatherData.high_temp,
      highlight: 'Afternoon peak - warmest part of day'
    },
    {
      time: '6:00 PM',
      temp: weatherData.high_temp - 5,
      highlight: 'Evening - temperatures cooling down'
    }
  ]
}

function getWeatherEmoji(conditions: string): string {
  const emojiMap: Record<string, string> = {
    'Clear': '☀️',
    'Sunny': '☀️',
    'Partly Cloudy': '⛅',
    'Cloudy': '☁️',
    'Overcast': '☁️',
    'Light Rain': '🌦️',
    'Rain': '🌧️',
    'Heavy Rain': '⛈️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Fog': '🌫️',
    'Windy': '💨'
  }
  
  return emojiMap[conditions] || '🌤️'
}

async function sendBriefingNotification(subscription: any, briefing: any) {
  // In production, use Web Push API to send notification
  try {
    // This would use webpush library in production
    console.log('Sending briefing notification:', {
      subscription,
      title: briefing.notification.title,
      body: briefing.notification.body
    })
    return true
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

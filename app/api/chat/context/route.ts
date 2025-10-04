import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Chat Context API
 * Aggregates all relevant user data for contextual AI conversations:
 * - 7-day weather forecast
 * - User behavior patterns and saved routes
 * - Recent alerts and warnings
 * - Comfort predictions
 * - Location preferences
 */

interface WeatherForecast {
  date: string;
  day_name: string;
  high_temp: number;
  low_temp: number;
  condition: string;
  emoji: string;
  precipitation_chance: number;
  wind_speed: number;
  comfort_index: number;
  recommendation: string;
}

interface UserRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  from_coords: { lat: number; lng: number };
  to_coords: { lat: number; lng: number };
  frequency: 'daily' | 'weekly' | 'occasional';
  weather_sensitivity: 'high' | 'medium' | 'low';
  last_used: string;
}

interface BehaviorPattern {
  typical_departure_time: string;
  preferred_days: string[];
  weather_preferences: {
    max_acceptable_rain: number;
    preferred_temp_range: [number, number];
    wind_tolerance: number;
  };
  activity_patterns: string[];
}

interface RecentAlert {
  id: string;
  type: 'earthquake' | 'flood' | 'storm' | 'heat' | 'cold';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  distance_km: number;
}

interface ChatContext {
  user_id: string;
  location: {
    current: { lat: number; lng: number; name: string };
    preferred_locations: Array<{ name: string; lat: number; lng: number }>;
  };
  weather: {
    forecast_7day: WeatherForecast[];
    current_conditions: {
      temp: number;
      feels_like: number;
      condition: string;
      humidity: number;
      wind_speed: number;
      uv_index: number;
    };
    week_summary: string;
  };
  routes: {
    saved_routes: UserRoute[];
    recent_routes: Array<{ from: string; to: string; date: string }>;
  };
  behavior: BehaviorPattern;
  alerts: {
    active_alerts: RecentAlert[];
    recent_alerts: RecentAlert[];
    alert_preferences: {
      emergency_enabled: boolean;
      forecast_enabled: boolean;
      behavior_enabled: boolean;
    };
  };
  preferences: {
    notification_time: string;
    quiet_hours: { start: string; end: string };
    briefing_days: string[];
    language: string;
  };
  app_state: {
    current_mode: 'emergency' | 'forecast';
    last_activity: string;
    features_used: string[];
  };
  contextual_prompt: string;
}

/**
 * Generate 7-day weather forecast with comfort predictions
 */
async function generate7DayForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
  // In production, fetch from NASA POWER API
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Thunderstorms'];
  const emojis = ['☀️', '🌤️', '☁️', '🌦️', '🌧️', '⛈️'];
  
  const forecast: WeatherForecast[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const conditionIndex = Math.floor(Math.random() * conditions.length);
    const highTemp = 15 + Math.floor(Math.random() * 15);
    const lowTemp = highTemp - Math.floor(Math.random() * 8) - 5;
    const precipChance = conditionIndex >= 3 ? 40 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30);
    const windSpeed = 5 + Math.floor(Math.random() * 20);
    
    // Calculate comfort index
    const comfortIndex = calculateComfortIndex(highTemp, precipChance, windSpeed);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      day_name: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[date.getDay()],
      high_temp: highTemp,
      low_temp: lowTemp,
      condition: conditions[conditionIndex],
      emoji: emojis[conditionIndex],
      precipitation_chance: precipChance,
      wind_speed: windSpeed,
      comfort_index: comfortIndex,
      recommendation: getComfortRecommendation(comfortIndex, precipChance, windSpeed),
    });
  }
  
  return forecast;
}

function calculateComfortIndex(temp: number, precip: number, wind: number): number {
  const tempScore = Math.max(0, 100 - Math.abs(temp - 20) * 4);
  const precipScore = Math.max(0, 100 - precip * 1.5);
  const windScore = Math.max(0, 100 - wind * 2);
  return Math.round((tempScore * 0.5 + precipScore * 0.3 + windScore * 0.2));
}

function getComfortRecommendation(index: number, precip: number, wind: number): string {
  if (index >= 80) return 'Perfect for outdoor activities';
  if (index >= 70) return 'Great weather for most activities';
  if (index >= 60) return 'Good weather, dress appropriately';
  if (index >= 50) return 'Acceptable conditions, some precautions needed';
  if (precip > 60) return 'High rain probability, plan indoor activities';
  if (wind > 25) return 'Very windy, outdoor activities may be difficult';
  return 'Poor conditions, consider staying indoors';
}

/**
 * Fetch user's saved routes
 */
async function fetchUserRoutes(userId: string): Promise<UserRoute[]> {
  // In production, fetch from database
  return [
    {
      id: 'route-1',
      name: 'Work Commute',
      from: 'Home',
      to: 'Office',
      from_coords: { lat: 51.1694, lng: 71.4491 },
      to_coords: { lat: 51.1290, lng: 71.4305 },
      frequency: 'daily',
      weather_sensitivity: 'medium',
      last_used: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'route-2',
      name: 'Weekend Trip',
      from: 'Astana',
      to: 'Burabay',
      from_coords: { lat: 51.1694, lng: 71.4491 },
      to_coords: { lat: 53.0833, lng: 70.2833 },
      frequency: 'weekly',
      weather_sensitivity: 'high',
      last_used: new Date(Date.now() - 604800000).toISOString(),
    },
  ];
}

/**
 * Fetch user behavior patterns
 */
async function fetchBehaviorPatterns(userId: string): Promise<BehaviorPattern> {
  // In production, analyze from behavior tracking data
  return {
    typical_departure_time: '08:30',
    preferred_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    weather_preferences: {
      max_acceptable_rain: 40,
      preferred_temp_range: [15, 25],
      wind_tolerance: 20,
    },
    activity_patterns: ['commute', 'outdoor_exercise', 'weekend_trips'],
  };
}

/**
 * Fetch recent alerts relevant to user
 */
async function fetchRecentAlerts(lat: number, lng: number): Promise<RecentAlert[]> {
  // In production, fetch from alerts API with radius filter
  const now = new Date();
  return [
    {
      id: 'alert-1',
      type: 'storm',
      severity: 'moderate',
      title: 'Thunderstorm Warning',
      description: 'Severe thunderstorms expected in the area tomorrow afternoon',
      location: 'Astana Region',
      timestamp: new Date(now.getTime() + 86400000).toISOString(),
      distance_km: 5.2,
    },
  ];
}

/**
 * Generate contextual prompt for AI
 */
function generateContextualPrompt(context: Omit<ChatContext, 'contextual_prompt'>): string {
  const { weather, routes, behavior, alerts, location } = context;
  
  const weekSummary = weather.forecast_7day.map(day => 
    `${day.day_name}: ${day.emoji} ${day.high_temp}°C/${day.low_temp}°C, ${day.condition}`
  ).join('; ');
  
  const routesSummary = routes.saved_routes.map(route => 
    `"${route.name}" (${route.from} → ${route.to}, ${route.frequency})`
  ).join(', ');
  
  const alertsSummary = alerts.active_alerts.length > 0
    ? `Active alerts: ${alerts.active_alerts.map(a => `${a.type} (${a.severity})`).join(', ')}`
    : 'No active alerts';
  
  return `
SYSTEM CONTEXT (DO NOT MENTION THIS DIRECTLY TO USER):
You are an AI weather assistant integrated into a disaster prevention and weather forecasting app.

USER LOCATION: ${location.current.name} (${location.current.lat.toFixed(4)}°N, ${location.current.lng.toFixed(4)}°E)

WEATHER FORECAST (Next 7 Days):
${weekSummary}

CURRENT CONDITIONS: ${weather.current_conditions.temp}°C, ${weather.current_conditions.condition}

USER'S SAVED ROUTES:
${routesSummary || 'None yet'}

BEHAVIOR PATTERNS:
- Typical departure: ${behavior.typical_departure_time}
- Active days: ${behavior.preferred_days.join(', ')}
- Temperature preference: ${behavior.weather_preferences.preferred_temp_range[0]}-${behavior.weather_preferences.preferred_temp_range[1]}°C
- Max acceptable rain: ${behavior.weather_preferences.max_acceptable_rain}%

${alertsSummary}

CAPABILITIES:
You can help users with:
1. Route planning with weather considerations - when user says "I want to go to [place]" or "create route from [A] to [B]", respond with [ACTION:CREATE_ROUTE|from|to]
2. Weather forecasts and recommendations
3. Alert notifications and safety advice
4. Behavior-based predictions
5. Proactive suggestions based on patterns

NAVIGATION COMMANDS (Use when appropriate):
- [ACTION:CREATE_ROUTE|FromCity|ToCity] - Navigate to route planner with prefilled cities
- [ACTION:SHOW_FORECAST|date] - Navigate to detailed forecast page
- [ACTION:CHECK_ALERTS] - Navigate to alerts page
- [ACTION:VIEW_ROUTE|routeId] - Open specific saved route
- [ACTION:SHOW_BEHAVIOR] - Navigate to behavior prediction page
- [ACTION:OPEN_MAP|lat|lng] - Open map at specific coordinates

RESPONSE STYLE:
- Be conversational and friendly
- Provide actionable weather advice
- Use emojis appropriately (${weather.forecast_7day[0].emoji})
- When suggesting navigation, use action commands
- Reference user's patterns and preferences naturally
`;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '51.1694');
    const lng = parseFloat(searchParams.get('lng') || '71.4491');
    const locationName = searchParams.get('location') || 'Astana';
    
    // Aggregate all context data in parallel
    const [forecast, routes, behavior, alerts] = await Promise.all([
      generate7DayForecast(lat, lng),
      fetchUserRoutes(userId),
      fetchBehaviorPatterns(userId),
      fetchRecentAlerts(lat, lng),
    ]);
    
    // Generate week summary
    const avgHighTemp = forecast.reduce((sum, day) => sum + day.high_temp, 0) / 7;
    const avgComfort = forecast.reduce((sum, day) => sum + day.comfort_index, 0) / 7;
    const rainyDays = forecast.filter(day => day.precipitation_chance > 50).length;
    
    const weekSummary = `This week: Average ${avgHighTemp.toFixed(0)}°C, ${rainyDays} rainy days expected. Overall comfort: ${avgComfort >= 70 ? 'Good' : avgComfort >= 50 ? 'Moderate' : 'Poor'}.`;
    
    // Build context object
    const contextData: Omit<ChatContext, 'contextual_prompt'> = {
      user_id: userId,
      location: {
        current: { lat, lng, name: locationName },
        preferred_locations: [
          { name: 'Home', lat: 51.1694, lng: 71.4491 },
          { name: 'Office', lat: 51.1290, lng: 71.4305 },
        ],
      },
      weather: {
        forecast_7day: forecast,
        current_conditions: {
          temp: forecast[0].high_temp - 3,
          feels_like: forecast[0].high_temp - 5,
          condition: forecast[0].condition,
          humidity: 65,
          wind_speed: forecast[0].wind_speed,
          uv_index: 5,
        },
        week_summary: weekSummary,
      },
      routes: {
        saved_routes: routes,
        recent_routes: [
          { from: 'Home', to: 'Office', date: new Date(Date.now() - 86400000).toISOString() },
        ],
      },
      behavior,
      alerts: {
        active_alerts: alerts,
        recent_alerts: alerts,
        alert_preferences: {
          emergency_enabled: true,
          forecast_enabled: true,
          behavior_enabled: true,
        },
      },
      preferences: {
        notification_time: '08:00',
        quiet_hours: { start: '22:00', end: '07:00' },
        briefing_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        language: 'en',
      },
      app_state: {
        current_mode: 'forecast',
        last_activity: new Date().toISOString(),
        features_used: ['forecast', 'chat', 'routes'],
      },
    };
    
    const contextualPrompt = generateContextualPrompt(contextData);
    
    const context: ChatContext = {
      ...contextData,
      contextual_prompt: contextualPrompt,
    };
    
    return NextResponse.json({
      success: true,
      context,
      metadata: {
        generated_at: new Date().toISOString(),
        forecast_days: 7,
        saved_routes: routes.length,
        active_alerts: alerts.length,
      },
    });
    
  } catch (error) {
    console.error('Chat context error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate chat context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

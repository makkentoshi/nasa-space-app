import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Scheduled Chat Initiator
 * Automatically starts conversations at configured times (e.g., 8 AM daily briefing)
 * 
 * This endpoint can be triggered by:
 * - Service Worker alarms
 * - Cron jobs
 * - User-configured notification schedules
 * 
 * Returns a proactive AI message that can be displayed in the chat interface
 */

interface ScheduledChatRequest {
  user_id: string;
  trigger_time: string; // ISO timestamp
  trigger_type: 'daily_briefing' | 'route_reminder' | 'alert_notification' | 'weather_update';
  location?: { lat: number; lng: number; name: string };
}

interface ProactiveChatMessage {
  message_id: string;
  timestamp: string;
  greeting: string;
  content: {
    summary: string;
    highlights: string[];
    recommendations: string[];
    warnings?: string[];
  };
  weather_snapshot: {
    current: {
      temp: number;
      condition: string;
      emoji: string;
    };
    today: {
      high: number;
      low: number;
      condition: string;
      emoji: string;
      precipitation_chance: number;
    };
    tomorrow: {
      high: number;
      low: number;
      condition: string;
      emoji: string;
    };
  };
  quick_actions: Array<{
    label: string;
    action: string;
    page?: string;
  }>;
  conversation_starters: string[];
}

/**
 * Generate greeting based on time of day
 */
function generateGreeting(hour: number, userName?: string): string {
  const name = userName ? `, ${userName}` : '';
  
  if (hour < 5) return `Good night${name}! 🌙`;
  if (hour < 12) return `Good morning${name}! ☀️`;
  if (hour < 18) return `Good afternoon${name}! 🌤️`;
  if (hour < 22) return `Good evening${name}! 🌆`;
  return `Good night${name}! 🌙`;
}

/**
 * Fetch context and generate daily briefing message
 */
async function generateDailyBriefing(
  userId: string,
  location: { lat: number; lng: number; name: string }
): Promise<ProactiveChatMessage> {
  try {
    // Fetch chat context (weather, routes, alerts, behavior)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const contextResponse = await fetch(
      `${baseUrl}/api/chat/context?lat=${location.lat}&lng=${location.lng}&location=${encodeURIComponent(location.name)}`,
      {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      }
    );
    
    let context = null;
    if (contextResponse.ok) {
      const data = await contextResponse.json();
      context = data.context;
    }
    
    // Build briefing
    const now = new Date();
    const hour = now.getHours();
    const greeting = generateGreeting(hour);
    
    const todayForecast = context?.weather?.forecast_7day?.[0];
    const tomorrowForecast = context?.weather?.forecast_7day?.[1];
    const currentConditions = context?.weather?.current_conditions;
    
    // Generate summary
    const summary = `${greeting} Here's your weather briefing for ${location.name}. ` +
      (todayForecast 
        ? `Today will be ${todayForecast.condition.toLowerCase()} with a high of ${todayForecast.high_temp}°C. ${todayForecast.recommendation}`
        : 'Weather data is currently unavailable.');
    
    // Generate highlights
    const highlights: string[] = [];
    
    if (todayForecast) {
      if (todayForecast.precipitation_chance > 60) {
        highlights.push(`🌧️ High chance of rain (${todayForecast.precipitation_chance}%) - bring an umbrella!`);
      }
      
      if (todayForecast.wind_speed > 25) {
        highlights.push(`💨 Windy conditions expected (${todayForecast.wind_speed} km/h)`);
      }
      
      if (todayForecast.comfort_index >= 80) {
        highlights.push(`✨ Excellent conditions for outdoor activities (comfort: ${todayForecast.comfort_index}/100)`);
      } else if (todayForecast.comfort_index < 50) {
        highlights.push(`⚠️ Poor weather conditions (comfort: ${todayForecast.comfort_index}/100) - plan indoor activities`);
      }
    }
    
    // Check for alerts
    const activeAlerts = context?.alerts?.active_alerts || [];
    if (activeAlerts.length > 0) {
      highlights.push(`🚨 ${activeAlerts.length} active weather alert${activeAlerts.length > 1 ? 's' : ''} in your area`);
    }
    
    // Saved routes
    const savedRoutes = context?.routes?.saved_routes || [];
    if (savedRoutes.length > 0 && todayForecast) {
      const dailyRoute = savedRoutes.find((r: any) => r.frequency === 'daily');
      if (dailyRoute) {
        const routeCondition = todayForecast.precipitation_chance > 50 
          ? 'expect delays due to rain'
          : todayForecast.comfort_index >= 70
            ? 'great conditions for your commute'
            : 'acceptable conditions';
        highlights.push(`🚗 ${dailyRoute.name}: ${routeCondition}`);
      }
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (todayForecast) {
      // Temperature-based clothing advice
      if (todayForecast.high_temp > 25) {
        recommendations.push('👕 Light clothing recommended - stay hydrated');
      } else if (todayForecast.high_temp < 10) {
        recommendations.push('🧥 Warm jacket needed - temperatures will be chilly');
      } else {
        recommendations.push('👔 Layer up - comfortable temperature expected');
      }
      
      // Activity recommendations
      if (todayForecast.comfort_index >= 70 && todayForecast.precipitation_chance < 30) {
        recommendations.push('🏃 Great day for outdoor exercise or activities');
      }
      
      // Tomorrow preview
      if (tomorrowForecast) {
        if (Math.abs(tomorrowForecast.high_temp - todayForecast.high_temp) > 5) {
          const change = tomorrowForecast.high_temp > todayForecast.high_temp ? 'warmer' : 'cooler';
          recommendations.push(`📅 Tomorrow will be ${change} (${tomorrowForecast.high_temp}°C)`);
        }
      }
    }
    
    // Generate warnings
    const warnings: string[] = [];
    
    if (activeAlerts.length > 0) {
      activeAlerts.forEach((alert: any) => {
        warnings.push(`${alert.title} - ${alert.description}`);
      });
    }
    
    // Quick actions
    const quickActions = [
      {
        label: 'View Full Forecast',
        action: 'SHOW_FORECAST',
        page: '/forecast',
      },
      {
        label: 'Plan a Route',
        action: 'CREATE_ROUTE',
        page: '/route',
      },
    ];
    
    if (activeAlerts.length > 0) {
      quickActions.push({
        label: 'Check Alerts',
        action: 'CHECK_ALERTS',
        page: '/alerts',
      });
    }
    
    // Conversation starters
    const conversationStarters = [
      'What should I wear today?',
      'Best time for outdoor activities?',
      'Will it rain this week?',
      'Plan my weekend trip',
    ];
    
    return {
      message_id: `scheduled-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: now.toISOString(),
      greeting,
      content: {
        summary,
        highlights,
        recommendations,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
      weather_snapshot: {
        current: {
          temp: currentConditions?.temp || todayForecast?.high_temp - 3 || 20,
          condition: currentConditions?.condition || todayForecast?.condition || 'Clear',
          emoji: todayForecast?.emoji || '☀️',
        },
        today: todayForecast ? {
          high: todayForecast.high_temp,
          low: todayForecast.low_temp,
          condition: todayForecast.condition,
          emoji: todayForecast.emoji,
          precipitation_chance: todayForecast.precipitation_chance,
        } : {
          high: 22,
          low: 15,
          condition: 'Clear',
          emoji: '☀️',
          precipitation_chance: 10,
        },
        tomorrow: tomorrowForecast ? {
          high: tomorrowForecast.high_temp,
          low: tomorrowForecast.low_temp,
          condition: tomorrowForecast.condition,
          emoji: tomorrowForecast.emoji,
        } : {
          high: 23,
          low: 16,
          condition: 'Partly Cloudy',
          emoji: '🌤️',
        },
      },
      quick_actions: quickActions,
      conversation_starters: conversationStarters,
    };
    
  } catch (error) {
    console.error('Error generating daily briefing:', error);
    throw error;
  }
}

/**
 * POST /api/chat/scheduled
 * Generate and return a scheduled proactive chat message
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    const body: ScheduledChatRequest = await request.json();
    
    // Validate trigger type
    const validTypes = ['daily_briefing', 'route_reminder', 'alert_notification', 'weather_update'];
    if (!validTypes.includes(body.trigger_type)) {
      return NextResponse.json(
        { error: `Invalid trigger_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Default location to Astana
    const location = body.location || {
      lat: 51.1694,
      lng: 71.4491,
      name: 'Astana',
    };
    
    // Generate appropriate message based on trigger type
    let proactiveMessage: ProactiveChatMessage;
    
    switch (body.trigger_type) {
      case 'daily_briefing':
        proactiveMessage = await generateDailyBriefing(userId, location);
        break;
        
      case 'route_reminder':
        // TODO: Implement route reminder message
        proactiveMessage = await generateDailyBriefing(userId, location);
        break;
        
      case 'alert_notification':
        // TODO: Implement alert notification message
        proactiveMessage = await generateDailyBriefing(userId, location);
        break;
        
      case 'weather_update':
        // TODO: Implement weather update message
        proactiveMessage = await generateDailyBriefing(userId, location);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported trigger type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: proactiveMessage,
      metadata: {
        user_id: userId,
        trigger_type: body.trigger_type,
        trigger_time: body.trigger_time,
        location: location.name,
      },
    });
    
  } catch (error) {
    console.error('Scheduled chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate scheduled message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/scheduled?user_id=xxx
 * Check if user has pending scheduled messages (for service worker)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const checkTime = searchParams.get('check_time') || new Date().toISOString();
    
    // TODO: Check user's notification settings from database
    // For now, return example schedule
    
    const now = new Date(checkTime);
    const hour = now.getHours();
    
    // Default: 8 AM daily briefing
    const shouldTrigger = hour === 8;
    
    return NextResponse.json({
      should_trigger: shouldTrigger,
      scheduled_time: '08:00',
      trigger_type: 'daily_briefing',
      next_trigger: new Date(now.setHours(8, 0, 0, 0)).toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check schedule' },
      { status: 500 }
    );
  }
}

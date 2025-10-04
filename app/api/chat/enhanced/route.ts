import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { detectIntent, formatIntentForAI, type DetectedIntent } from '@/lib/chat/intent-detector';

/**
 * Enhanced Chat API with Context Injection and Intent Detection
 * Features:
 * - Automatic context loading (weather, routes, alerts, behavior)
 * - Intent detection for navigation commands
 * - Streaming responses
 * - Function calling for app integrations
 * - Rich metadata in responses
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  location?: { lat: number; lng: number; name: string };
  include_context?: boolean;
  stream?: boolean;
}

interface ChatResponse {
  message: string;
  intent?: DetectedIntent;
  navigation?: {
    page: string;
    params?: Record<string, string>;
    action_command?: string;
  };
  suggestions?: string[];
  metadata?: {
    context_used: boolean;
    model: string;
    tokens_used?: number;
    weather_forecast?: any;
  };
}

/**
 * Fetch comprehensive chat context
 */
async function fetchChatContext(
  userId: string, 
  lat: number, 
  lng: number, 
  locationName: string
): Promise<any> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/chat/context?lat=${lat}&lng=${lng}&location=${encodeURIComponent(locationName)}`,
      {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch chat context:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.context;
  } catch (error) {
    console.error('Error fetching chat context:', error);
    return null;
  }
}

/**
 * Generate smart suggestions based on context and intent
 */
function generateSuggestions(intent: DetectedIntent, context: any): string[] {
  const suggestions: string[] = [];
  
  // Intent-based suggestions
  if (intent.type === 'create_route') {
    suggestions.push('Show me weather along the route');
    suggestions.push('When is the best time to travel?');
    suggestions.push('Are there any alerts on this route?');
  } else if (intent.type === 'view_forecast') {
    suggestions.push('What should I wear today?');
    suggestions.push('Plan my outdoor activities');
    suggestions.push('Show me the week ahead');
  } else if (intent.type === 'general_chat') {
    // Context-based suggestions
    if (context?.weather?.forecast_7day) {
      const forecast = context.weather.forecast_7day[0];
      if (forecast.precipitation_chance > 50) {
        suggestions.push('Will it rain tomorrow?');
        suggestions.push('Best days for outdoor activities this week?');
      }
    }
    
    if (context?.routes?.saved_routes?.length > 0) {
      suggestions.push(`Check weather for ${context.routes.saved_routes[0].name}`);
    }
    
    suggestions.push('Create a route to...', 'Check alerts', 'Show weather map');
  }
  
  return suggestions.slice(0, 3);
}

/**
 * POST /api/chat/enhanced
 * Main chat endpoint with full context integration
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
    
    const body: ChatRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Default location to Astana if not provided
    const location = body.location || {
      lat: 51.1694,
      lng: 71.4491,
      name: 'Astana',
    };
    
    // Detect user intent
    const conversationHistory = body.conversation_history?.map(m => m.content) || [];
    const intent = detectIntent(body.message);
    const intentContext = formatIntentForAI(intent);
    
    // Fetch comprehensive context if requested (default: true)
    let context = null;
    if (body.include_context !== false) {
      context = await fetchChatContext(userId, location.lat, location.lng, location.name);
    }
    
    // Build messages array for OpenAI
    const messages: ChatMessage[] = [];
    
    // System message with context
    if (context) {
      messages.push({
        role: 'system',
        content: context.contextual_prompt,
      });
    } else {
      messages.push({
        role: 'system',
        content: `You are a helpful AI weather assistant. You help users with weather forecasts, route planning, and safety recommendations. Be friendly and concise.`,
      });
    }
    
    // Add conversation history
    if (body.conversation_history && body.conversation_history.length > 0) {
      messages.push(...body.conversation_history);
    }
    
    // Add current user message with intent context
    messages.push({
      role: 'user',
      content: body.message + intentContext,
    });
    
    // Stream response if requested
    if (body.stream) {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      });
      
      // Create streaming response
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                const data = JSON.stringify({ content });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            
            // Send intent and navigation info at the end
            if (intent.navigation) {
              const navData = JSON.stringify({ 
                intent, 
                navigation: intent.navigation,
                action_command: intent.action_command,
              });
              controller.enqueue(encoder.encode(`data: ${navData}\n\n`));
            }
            
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });
      
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // Non-streaming response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800,
    });
    
    const assistantMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.';
    
    // Generate suggestions
    const suggestions = generateSuggestions(intent, context);
    
    // Build response
    const response: ChatResponse = {
      message: assistantMessage,
      intent: intent.type !== 'general_chat' ? intent : undefined,
      navigation: intent.navigation ? {
        page: intent.navigation.page,
        params: intent.navigation.params,
        action_command: intent.action_command,
      } : undefined,
      suggestions,
      metadata: {
        context_used: !!context,
        model: 'gpt-4o-mini',
        tokens_used: completion.usage?.total_tokens,
        weather_forecast: context?.weather?.forecast_7day?.slice(0, 3), // Include 3-day forecast
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Enhanced chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/enhanced?preview=true
 * Get preview of chat capabilities and context
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
    const preview = searchParams.get('preview') === 'true';
    
    if (preview) {
      return NextResponse.json({
        capabilities: [
          'Context-aware weather conversations',
          'Automatic route planning from natural language',
          'Smart intent detection and navigation',
          '7-day forecast integration',
          'Personalized recommendations based on behavior',
          'Real-time alert notifications',
          'Streaming responses for better UX',
        ],
        example_queries: [
          'What\'s the weather like this week?',
          'I want to go from Astana to Almaty',
          'Show me the weather map',
          'Are there any alerts?',
          'What should I wear today?',
          'Best time for outdoor activities?',
        ],
        supported_languages: ['English', 'Russian'],
        models: ['gpt-4o-mini'],
      });
    }
    
    return NextResponse.json({ 
      message: 'Enhanced chat API is ready',
      version: '2.0',
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get chat info' },
      { status: 500 }
    );
  }
}

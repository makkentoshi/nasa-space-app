/**
 * Intent Detection System
 * Analyzes user messages to detect intentions and generate navigation commands
 */

export type IntentType = 
  | 'create_route'
  | 'view_forecast'
  | 'check_alerts'
  | 'view_map'
  | 'behavior_prediction'
  | 'weather_query'
  | 'route_query'
  | 'general_chat'
  | 'settings'
  | 'emergency_sos';

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  entities: {
    locations?: string[];
    from_location?: string;
    to_location?: string;
    date?: string;
    time?: string;
    coordinates?: { lat: number; lng: number };
  };
  navigation?: {
    page: string;
    params?: Record<string, string>;
    prefill?: Record<string, any>;
  };
  action_command?: string;
}

interface PatternMatcher {
  pattern: RegExp;
  type: IntentType;
  extractor?: (match: RegExpMatchArray, message: string) => Partial<DetectedIntent>;
}

/**
 * Pattern matchers for different intents
 */
const INTENT_PATTERNS: PatternMatcher[] = [
  // Route creation patterns
  {
    pattern: /(?:создать|создай|построй|построить|проложи|проложить|маршрут|route|go|travel|drive)\s+(?:from|из|от)\s+([а-яёa-z\s]+)\s+(?:to|в|до|на)\s+([а-яёa-z\s]+)/i,
    type: 'create_route',
    extractor: (match) => ({
      entities: {
        from_location: match[1].trim(),
        to_location: match[2].trim(),
      },
      navigation: {
        page: '/route',
        params: {
          from: match[1].trim(),
          to: match[2].trim(),
        },
      },
      action_command: `CREATE_ROUTE|${match[1].trim()}|${match[2].trim()}`,
    })
  },
  {
    pattern: /(?:хочу|want|need|нужно)\s+(?:съездить|поехать|go|travel)\s+(?:в|to|на|до)\s+([а-яёa-z\s]+)/i,
    type: 'create_route',
    extractor: (match, message) => {
      // Try to find "from" location in context
      const fromMatch = message.match(/(?:из|from|от)\s+([а-яёa-z\s]+)/i);
      return {
        entities: {
          to_location: match[1].trim(),
          from_location: fromMatch ? fromMatch[1].trim() : undefined,
        },
        navigation: {
          page: '/route',
          params: {
            to: match[1].trim(),
            ...(fromMatch ? { from: fromMatch[1].trim() } : {}),
          },
        },
        action_command: `CREATE_ROUTE|${fromMatch ? fromMatch[1].trim() : 'current'}|${match[1].trim()}`,
      };
    }
  },
  
  // Forecast viewing patterns
  {
    pattern: /(?:погода|weather|forecast|прогноз)\s+(?:на|for|in)\s+([а-яёa-z\s]+)/i,
    type: 'view_forecast',
    extractor: (match) => ({
      entities: {
        locations: [match[1].trim()],
      },
      navigation: {
        page: '/forecast',
        params: {
          location: match[1].trim(),
        },
      },
      action_command: `SHOW_FORECAST|${match[1].trim()}`,
    })
  },
  {
    pattern: /(?:какая|what|show|покажи|показать)\s+(?:погода|weather|forecast|прогноз)/i,
    type: 'view_forecast',
    extractor: () => ({
      navigation: {
        page: '/forecast',
      },
      action_command: 'SHOW_FORECAST',
    })
  },
  {
    pattern: /(?:прогноз|forecast)\s+(?:на|for)\s+(неделю|week|завтра|tomorrow|сегодня|today)/i,
    type: 'view_forecast',
    extractor: (match) => {
      const period = match[1].toLowerCase();
      const dateMap: Record<string, string> = {
        'завтра': 'tomorrow',
        'tomorrow': 'tomorrow',
        'сегодня': 'today',
        'today': 'today',
        'неделю': 'week',
        'week': 'week',
      };
      return {
        entities: {
          date: dateMap[period] || period,
        },
        navigation: {
          page: '/forecast',
          params: {
            period: dateMap[period] || period,
          },
        },
        action_command: `SHOW_FORECAST|${dateMap[period] || period}`,
      };
    }
  },
  
  // Alert checking patterns
  {
    pattern: /(?:проверь|check|show|покажи|показать)\s+(?:alert|alerts|предупреждение|предупреждения|уведомления)/i,
    type: 'check_alerts',
    extractor: () => ({
      navigation: {
        page: '/alerts',
      },
      action_command: 'CHECK_ALERTS',
    })
  },
  {
    pattern: /(?:есть|are|any)\s+(?:alert|alerts|предупреждение|предупреждения)/i,
    type: 'check_alerts',
    extractor: () => ({
      navigation: {
        page: '/alerts',
      },
      action_command: 'CHECK_ALERTS',
    })
  },
  
  // Map viewing patterns
  {
    pattern: /(?:открой|open|show|покажи|показать)\s+(?:карту|map)/i,
    type: 'view_map',
    extractor: () => ({
      navigation: {
        page: '/forecast/map',
      },
      action_command: 'OPEN_MAP',
    })
  },
  {
    pattern: /(?:карта|map)\s+(?:погоды|weather)/i,
    type: 'view_map',
    extractor: () => ({
      navigation: {
        page: '/forecast/map',
      },
      action_command: 'OPEN_MAP',
    })
  },
  
  // Behavior prediction patterns
  {
    pattern: /(?:поведение|behavior|pattern|паттерн|prediction|предсказание)/i,
    type: 'behavior_prediction',
    extractor: () => ({
      navigation: {
        page: '/forecast/behavior',
      },
      action_command: 'SHOW_BEHAVIOR',
    })
  },
  
  // Settings patterns
  {
    pattern: /(?:настройки|settings|preferences|параметры)/i,
    type: 'settings',
    extractor: () => ({
      navigation: {
        page: '/settings',
      },
      action_command: 'OPEN_SETTINGS',
    })
  },
  
  // Emergency SOS patterns
  {
    pattern: /(?:помощь|help|emergency|срочно|sos|911)/i,
    type: 'emergency_sos',
    extractor: () => ({
      navigation: {
        page: '/sos',
      },
      action_command: 'EMERGENCY_SOS',
    })
  },
];

/**
 * City name database for location extraction
 */
const KNOWN_CITIES = [
  'Astana', 'Астана',
  'Almaty', 'Алматы',
  'Shymkent', 'Шымкент',
  'Karaganda', 'Караганда',
  'Aktobe', 'Актобе',
  'Taraz', 'Тараз',
  'Pavlodar', 'Павлодар',
  'Semey', 'Семей',
  'Atyrau', 'Атырау',
  'Kostanay', 'Костанай',
  'Kyzylorda', 'Кызылорда',
  'Aktau', 'Актау',
  'Burabay', 'Бурабай',
  'Borovoe', 'Боровое',
];

/**
 * Extract city names from text
 */
function extractCities(text: string): string[] {
  const cities: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const city of KNOWN_CITIES) {
    if (lowerText.includes(city.toLowerCase())) {
      cities.push(city);
    }
  }
  
  // Remove duplicates using Array.from()
  return Array.from(new Set(cities));
}

/**
 * Calculate confidence score for intent detection
 */
function calculateConfidence(
  match: RegExpMatchArray | null,
  message: string,
  type: IntentType
): number {
  if (!match) return 0;
  
  let confidence = 0.7; // Base confidence for pattern match
  
  // Boost confidence based on message characteristics
  const messageLength = message.split(' ').length;
  if (messageLength >= 5 && messageLength <= 20) {
    confidence += 0.1; // Well-formed questions
  }
  
  // Boost for specific intent types
  if (type === 'create_route' && message.match(/(?:from|из|от).*(?:to|в|до)/i)) {
    confidence += 0.15; // Clear route intent
  }
  
  // Boost for question words
  if (message.match(/(?:как|what|when|where|когда|где|какой)/i)) {
    confidence += 0.05;
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * Detect intent from user message
 */
export function detectIntent(message: string): DetectedIntent {
  const normalizedMessage = message.trim();
  
  // Try each pattern matcher
  for (const matcher of INTENT_PATTERNS) {
    const match = normalizedMessage.match(matcher.pattern);
    
    if (match) {
      const baseIntent: DetectedIntent = {
        type: matcher.type,
        confidence: calculateConfidence(match, normalizedMessage, matcher.type),
        entities: {},
      };
      
      // Apply custom extractor if available
      if (matcher.extractor) {
        const extracted = matcher.extractor(match, normalizedMessage);
        Object.assign(baseIntent, extracted);
      }
      
      // Extract any additional cities mentioned
      const cities = extractCities(normalizedMessage);
      if (cities.length > 0) {
        baseIntent.entities.locations = cities;
      }
      
      return baseIntent;
    }
  }
  
  // Default to general chat if no pattern matches
  return {
    type: 'general_chat',
    confidence: 1.0,
    entities: {
      locations: extractCities(normalizedMessage),
    },
  };
}

/**
 * Generate navigation command string for AI response
 */
export function generateNavigationCommand(intent: DetectedIntent): string | null {
  if (!intent.navigation) return null;
  
  const { page, params } = intent.navigation;
  const queryString = params 
    ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    : '';
  
  return `${page}${queryString}`;
}

/**
 * Format intent for AI context injection
 */
export function formatIntentForAI(intent: DetectedIntent): string {
  if (intent.type === 'general_chat') {
    return '';
  }
  
  let context = `\n[DETECTED INTENT: ${intent.type.toUpperCase()} (confidence: ${(intent.confidence * 100).toFixed(0)}%)]`;
  
  if (intent.entities.from_location || intent.entities.to_location) {
    context += `\n[USER WANTS ROUTE: ${intent.entities.from_location || 'current location'} → ${intent.entities.to_location}]`;
  }
  
  if (intent.navigation) {
    const navUrl = generateNavigationCommand(intent);
    context += `\n[SUGGEST NAVIGATION: ${navUrl}]`;
    context += `\n[ACTION COMMAND: ${intent.action_command}]`;
  }
  
  return context;
}

/**
 * Check if message is a follow-up to route creation
 */
export function isRouteFollowUp(message: string, conversationHistory: string[]): boolean {
  const recentMessages = conversationHistory.slice(-5).join(' ').toLowerCase();
  
  const hasRouteContext = recentMessages.includes('route') || 
                          recentMessages.includes('маршрут') ||
                          recentMessages.includes('go to') ||
                          recentMessages.includes('поехать');
  
  const isConfirmation = message.match(/(?:да|yes|ok|okay|давай|let's go|поехали)/i);
  
  return hasRouteContext && !!isConfirmation;
}

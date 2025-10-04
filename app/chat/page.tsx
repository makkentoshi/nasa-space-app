'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  MapPin,
  Calendar,
  Bell,
  Menu,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import BackButton from '@/components/ui/BackButton';
import { WeatherForecastCard, WeatherSummaryCard } from '@/components/chat/WeatherForecastCard';
import { 
  ActionButtons, 
  NavigationPrompt, 
  ConversationStarters, 
  TypingIndicator 
} from '@/components/chat/ChatActions';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intent?: {
    type: string;
    confidence: number;
  };
  navigation?: {
    page: string;
    params?: Record<string, string>;
    action_command?: string;
  };
  metadata?: {
    weather_forecast?: any[];
    suggestions?: string[];
    quick_actions?: any[];
  };
}

interface ScheduledMessage {
  message_id: string;
  greeting: string;
  content: {
    summary: string;
    highlights: string[];
    recommendations: string[];
    warnings?: string[];
  };
  weather_snapshot: any;
  quick_actions: any[];
  conversation_starters: string[];
}

export default function ChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState({ lat: 51.1694, lng: 71.4491, name: 'Astana' });
  const [scheduledBriefing, setScheduledBriefing] = useState<ScheduledMessage | null>(null);
  const [showWeatherSidebar, setShowWeatherSidebar] = useState(true);
  const [weekForecast, setWeekForecast] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('enhanced-chat-messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('enhanced-chat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, [messages]);

  // Load scheduled briefing on mount
  useEffect(() => {
    loadScheduledBriefing();
    loadWeatherForecast();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function loadScheduledBriefing() {
    try {
      const response = await fetch('/api/chat/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'guest',
          trigger_time: new Date().toISOString(),
          trigger_type: 'daily_briefing',
          location,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScheduledBriefing(data.message);
        
        // Auto-add briefing as first message if no messages exist
        if (messages.length === 0) {
          addBriefingMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Failed to load briefing:', error);
    }
  }

  async function loadWeatherForecast() {
    try {
      const response = await fetch(
        `/api/chat/context?lat=${location.lat}&lng=${location.lng}&location=${encodeURIComponent(location.name)}`
      );

      if (response.ok) {
        const data = await response.json();
        setWeekForecast(data.context?.weather?.forecast_7day || []);
      }
    } catch (error) {
      console.error('Failed to load forecast:', error);
    }
  }

  function addBriefingMessage(briefing: ScheduledMessage) {
    const message: ChatMessage = {
      id: briefing.message_id,
      role: 'assistant',
      content: `${briefing.greeting}\n\n${briefing.content.summary}\n\n**Highlights:**\n${briefing.content.highlights.map(h => `• ${h}`).join('\n')}\n\n**Recommendations:**\n${briefing.content.recommendations.map(r => `• ${r}`).join('\n')}`,
      timestamp: Date.now(),
      metadata: {
        weather_forecast: [briefing.weather_snapshot.today],
        suggestions: briefing.conversation_starters,
        quick_actions: briefing.quick_actions,
      },
    };
    setMessages([message]);
  }

  async function sendMessage(text?: string) {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call enhanced chat API
      const response = await fetch('/api/chat/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          location,
          include_context: true,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        intent: data.intent,
        navigation: data.navigation,
        metadata: {
          weather_forecast: data.metadata?.weather_forecast,
          suggestions: data.suggestions,
          quick_actions: data.metadata?.quick_actions,
        },
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Show navigation prompt if detected
      if (data.navigation) {
        toast.info('I can help you navigate there!', {
          action: {
            label: 'Go',
            onClick: () => router.push(data.navigation.page),
          },
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-4 relative">
            <BackButton onClick={() => router.back()} />
            <PageHeader
              title="AI Weather Assistant"
              subtitle="Ask me anything about weather, routes, alerts, and get personalized recommendations"
              icon={<Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
              bgColor="transparent"
              textColor="#1e40af"
            />
          </div>

          <div className="flex gap-4">
            {/* Main Chat Area */}
            <div className="flex-1 max-w-4xl">
              {/* Messages Container */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4">
                    {/* Welcome Message */}
                    {messages.length === 0 && !scheduledBriefing && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👋</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Welcome to AI Weather Assistant!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          I'm here to help you with weather forecasts, route planning, and safety recommendations.
                        </p>
                        
                        {scheduledBriefing && (
                          <Button
                            onClick={() => addBriefingMessage(scheduledBriefing)}
                            className="mb-4"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Show Today's Briefing
                          </Button>
                        )}
                        
                        <ConversationStarters
                          starters={[
                            'What\'s the weather like today?',
                            'I want to go from Astana to Almaty',
                            'Show me this week\'s forecast',
                            'Are there any alerts?',
                          ]}
                          onStarterClick={sendMessage}
                        />
                      </div>
                    )}

                    {/* Messages */}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          max-w-[80%] rounded-lg p-4
                          ${message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }
                        `}>
                          {/* Message Content */}
                          <div className="whitespace-pre-wrap">{message.content}</div>

                          {/* Weather Forecast Card */}
                          {message.metadata?.weather_forecast && message.metadata.weather_forecast.length > 0 && (
                            <WeatherSummaryCard
                              temp={message.metadata.weather_forecast[0].high_temp || 20}
                              condition={message.metadata.weather_forecast[0].condition || 'Clear'}
                              emoji={message.metadata.weather_forecast[0].emoji || '☀️'}
                              precipitation_chance={message.metadata.weather_forecast[0].precipitation_chance}
                              wind_speed={message.metadata.weather_forecast[0].wind_speed}
                            />
                          )}

                          {/* Navigation Prompt */}
                          {message.navigation && (
                            <NavigationPrompt
                              page={message.navigation.page}
                              title={`Go to ${message.navigation.page.split('/').pop()}`}
                              description={`I can take you there to ${message.navigation.action_command?.toLowerCase()}`}
                              params={message.navigation.params}
                              actionLabel="Let's Go!"
                            />
                          )}

                          {/* Quick Actions */}
                          {message.metadata?.quick_actions && message.metadata.quick_actions.length > 0 && (
                            <ActionButtons actions={message.metadata.quick_actions} />
                          )}

                          {/* Suggestions */}
                          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && message.role === 'assistant' && (
                            <ConversationStarters
                              starters={message.metadata.suggestions}
                              onStarterClick={sendMessage}
                            />
                          )}

                          {/* Timestamp */}
                          <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && <TypingIndicator userName="AI Assistant" />}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about weather, routes, alerts..."
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button
                        onClick={() => sendMessage()}
                        disabled={!inputText.trim() || isTyping}
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Action Chips */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage('Show me weather map')}
                        className="text-xs"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Weather Map
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage('Check alerts')}
                        className="text-xs"
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        Check Alerts
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage('What should I wear today?')}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recommendations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weather Sidebar */}
            {showWeatherSidebar && (
              <div className="w-80 hidden lg:block">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        7-Day Forecast
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowWeatherSidebar(false)}
                        className="h-6 w-6"
                      >
                        <Menu className="w-4 h-4" />
                      </Button>
                    </div>

                    {weekForecast.length > 0 ? (
                      <WeatherForecastCard
                        forecast={weekForecast}
                        location={location.name}
                        compact={false}
                        showActions={false}
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Loading forecast...
                      </div>
                    )}

                    {scheduledBriefing && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => addBriefingMessage(scheduledBriefing)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Daily Briefing
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

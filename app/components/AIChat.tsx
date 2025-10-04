"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { AIQueryResponse } from '@/app/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface AIChatProps {
  onQuery: (query: string) => Promise<void>;
  response?: AIQueryResponse;
  loading?: boolean;
  error?: string;
  className?: string;
  // New props for OpenAI integration
  weatherData?: {
    temperature?: number;
    precipitation?: number;
    windSpeed?: number;
    humidity?: number;
    location?: string;
    date?: string;
  };
}

export default function AIChat({ 
  onQuery, 
  response, 
  loading, 
  error, 
  className = '',
  weatherData 
}: AIChatProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Add response to messages when it arrives
  useEffect(() => {
    if (response && !loading) {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  }, [response, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentQuery = query;
    setQuery('');

    // Try streaming with OpenAI first, fall back to onQuery
    try {
      await streamOpenAIResponse(currentQuery);
    } catch (err) {
      // Fallback to non-streaming API
      await onQuery(currentQuery);
    }
  };

  const streamOpenAIResponse = async (userQuery: string) => {
    setIsStreaming(true);
    setStreamingContent('');
    
    abortControllerRef.current = new AbortController();

    try {
      // Build context from weather data
      const context = weatherData ? `
Current weather conditions:
- Location: ${weatherData.location || 'Unknown'}
- Date: ${weatherData.date || 'Today'}
- Temperature: ${weatherData.temperature !== undefined ? `${weatherData.temperature}°C` : 'N/A'}
- Precipitation: ${weatherData.precipitation !== undefined ? `${weatherData.precipitation}mm` : 'N/A'}
- Wind Speed: ${weatherData.windSpeed !== undefined ? `${weatherData.windSpeed} m/s` : 'N/A'}
- Humidity: ${weatherData.humidity !== undefined ? `${weatherData.humidity}%` : 'N/A'}
      `.trim() : 'No weather data available.';

      const systemPrompt = `You are ForecastGPT-5, an advanced weather forecasting AI assistant built for the resQ app. Your role is to:
1. Analyze weather data and provide accurate, actionable insights
2. Assess risks for outdoor events and activities
3. Make specific recommendations based on weather conditions
4. Explain complex weather phenomena in simple terms
5. Predict next-day weather trends with confidence levels

Be concise, friendly, and always prioritize user safety. Use emojis to make responses engaging.`;

      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${context}\n\nUser Question: ${userQuery}` },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Streaming not available');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  accumulatedContent += content;
                  setStreamingContent(accumulatedContent);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Save final message
      if (accumulatedContent) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: accumulatedContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

      setStreamingContent('');
      setIsStreaming(false);
    } catch (err) {
      console.error('Streaming error:', err);
      setStreamingContent('');
      setIsStreaming(false);
      throw err;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      
      // Save partial message
      if (streamingContent) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: streamingContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingContent('');
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent('');
  };

  const suggestedQuestions = [
    "Is it likely to rain during my outdoor event?",
    "What are the chances of extreme heat?",
    "Should I be worried about high winds?",
    "Is this a good day for a parade?",
    "What should I wear tomorrow?",
    "Will there be storms this week?",
  ];

  return (
    <div className={`${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105"
      >
        <span className="text-xl">🤖</span>
        <span className="font-semibold">Ask AI</span>
        {messages.length > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            {messages.length}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[70vh] animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">ForecastGPT-5</h3>
              <p className="text-xs opacity-90">Powered by OpenAI</p>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-white/80 hover:text-white text-sm px-2"
                  title="Clear chat"
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && !loading && !isStreaming && (
              <div>
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <p className="text-sm text-gray-700 mb-2">
                    👋 Hi! I'm ForecastGPT-5, your AI weather assistant. Ask me anything about:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4">
                    <li>• Weather conditions and forecasts</li>
                    <li>• Risk assessment for events</li>
                    <li>• What to wear and bring</li>
                    <li>• Activity recommendations</li>
                  </ul>
                </div>
                
                {weatherData && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs">
                    <p className="font-bold text-blue-900 mb-2">📍 Current Context:</p>
                    <div className="grid grid-cols-2 gap-2 text-gray-700">
                      {weatherData.location && <p>Location: {weatherData.location}</p>}
                      {weatherData.temperature !== undefined && <p>Temp: {weatherData.temperature}°C</p>}
                      {weatherData.precipitation !== undefined && <p>Rain: {weatherData.precipitation}mm</p>}
                      {weatherData.windSpeed !== undefined && <p>Wind: {weatherData.windSpeed} m/s</p>}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">💡 Try asking:</p>
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(q)}
                      className="block w-full text-left text-xs bg-white hover:bg-gray-100 p-3 rounded-lg transition shadow-sm border border-gray-100"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-gray-800 shadow-sm border border-gray-100">
                  <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !isStreaming && (
              <div className="flex justify-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about weather..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || isStreaming}
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="bg-red-500 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-600 transition"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition hover:scale-105"
                >
                  Send
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

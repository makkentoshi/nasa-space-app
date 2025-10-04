'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, ArrowLeft, MapPin, Thermometer, CloudRain, Cloud } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import { useWeatherInsightsStore } from '@/lib/store/useWeatherInsightsStore';
import { AppShell } from '@/components/layout/AppShell';

export default function AIWeatherChat() {
  const { location: locationState } = useAppStore();
  const { currentConversation, addMessage, clearCurrentConversation } = useWeatherInsightsStore();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const location = locationState.location;
  const locationName = locationState.locationName;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const sendMessage = async () => {
    if (!message.trim() || !location || !currentConversation) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);

    try {
      const response = await fetch('/api/forecast/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            lat: location.lat,
            lng: location.lng,
            name: locationName
          },
          type: currentConversation.insightType,
          conversationContext: currentConversation.messages,
          userMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        addMessage('assistant', data.insight);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'precipitation':
        return <CloudRain className="h-5 w-5" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'temperature':
        return 'text-blue-600 bg-blue-50';
      case 'precipitation':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  if (!currentConversation) {
    return (
      <AppShell>
        <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen">
          <div className="rounded-2xl shadow-sm bg-white p-6 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">No Active Conversation</h1>
            <p className="text-gray-500 mb-4">Start a conversation by clicking &quot;Details&quot; on a weather insight</p>
            <Link href="/forecast">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Back to Forecast
              </button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen flex flex-col">
        {/* Header */}
        <div className="rounded-2xl shadow-sm bg-white p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/forecast">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div className={`p-2 rounded-lg ${getTypeColor(currentConversation.insightType)}`}>
              {getTypeIcon(currentConversation.insightType)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">AI Weather Chat</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{currentConversation.location}</span>
                <span>•</span>
                <span className="capitalize">{currentConversation.insightType} Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 rounded-2xl shadow-sm bg-white mb-4 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {currentConversation.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-[80%] p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about the weather analysis..."
                className="flex-1 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl shadow-sm bg-white p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Questions</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              "What should I wear today?",
              "Will it rain in the next few hours?",
              "How will the weather change tomorrow?",
              "Should I bring an umbrella?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="text-left p-3 text-sm border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
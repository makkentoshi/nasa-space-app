'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, Send, ArrowLeft, MapPin, AlertTriangle, Phone, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emergencyInstructions?: string[];
  safetyTips?: string[];
  videos?: { title: string; url: string }[];
  officialSources?: {
    redCross?: string;
    fema?: string;
    usgs?: string;
    kazakhstan?: string;
  };
  rescueCall?: {
    phoneNumber: string;
    script: string;
  };
}

interface EmergencyContext {
  type: 'earthquake' | 'tsunami' | 'fire' | 'flood' | 'medical' | 'accident' | 'violence' | 'other';
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function EmergencyChatPage() {
  const { location: locationState } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyContext, setEmergencyContext] = useState<EmergencyContext>({
    type: 'earthquake',
    severity: 'severe',
    location: {
      lat: locationState.location?.lat || 51.1159933,
      lng: locationState.location?.lng || 71.4677059,
      name: locationState.locationName || 'Current Location'
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial emergency request
    if (messages.length === 0) {
      sendInitialEmergencyMessage();
    }
  }, []);

  const sendInitialEmergencyMessage = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/emergency/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyType: emergencyContext.type,
          severity: emergencyContext.severity,
          location: emergencyContext.location,
          language: 'en',
          autoCallRescue: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.notificationMessage || 'Emergency response system activated.',
          timestamp: new Date(),
          emergencyInstructions: data.emergencyInstructions,
          safetyTips: data.safetyTips,
          videos: data.videos,
          officialSources: data.officialInstructions,
          rescueCall: data.rescueCallInfo
        };
        
        setMessages([assistantMessage]);
        toast.success('Emergency AI Assistant activated!', {
          description: 'Ask me anything about this emergency situation'
        });
      } else {
        throw new Error('Failed to activate emergency assistant');
      }
    } catch (error) {
      console.error('Error activating emergency assistant:', error);
      toast.error('Failed to activate emergency assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/emergency/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyType: emergencyContext.type,
          severity: emergencyContext.severity,
          location: emergencyContext.location,
          customPrompt: userMessage,
          language: 'en',
          autoCallRescue: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.emergencyInstructions?.join('\n\n') || 'I\'m here to help. What would you like to know?',
          timestamp: new Date(),
          emergencyInstructions: data.emergencyInstructions,
          safetyTips: data.safetyTips,
          videos: data.videos,
          officialSources: data.officialInstructions
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try calling emergency services at 112.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'bg-red-600 text-white';
      case 'severe':
        return 'bg-orange-600 text-white';
      case 'moderate':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      earthquake: '🌍',
      tsunami: '🌊',
      fire: '🔥',
      flood: '💧',
      medical: '🏥',
      accident: '🚗',
      violence: '🚨',
      other: '⚠️'
    };
    return emojis[type] || '⚠️';
  };

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen flex flex-col">
        {/* Header */}
        <div className="rounded-2xl shadow-sm bg-white p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#53B175]" />
                <h1 className="text-lg font-bold text-gray-900">Emergency AI Assistant</h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{emergencyContext.location.name}</span>
              </div>
            </div>
            <Badge className={getSeverityColor(emergencyContext.severity)}>
              {emergencyContext.severity.toUpperCase()}
            </Badge>
          </div>

          {/* Emergency Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['earthquake', 'tsunami', 'fire', 'flood', 'medical', 'accident'] as const).map((type) => (
              <Button
                key={type}
                variant={emergencyContext.type === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmergencyContext(prev => ({ ...prev, type }))}
                className={emergencyContext.type === type ? 'bg-[#53B175] hover:bg-[#4a9c65]' : ''}
              >
                <span className="mr-1">{getTypeEmoji(type)}</span>
                <span className="capitalize">{type}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-2xl shadow-sm bg-white mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                onClick={() => window.open('tel:112')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 112
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#53B175] text-[#53B175] hover:bg-[#53B175] hover:text-white"
                onClick={() => {
                  const text = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
                  if (navigator.share) {
                    navigator.share({
                      title: 'Emergency Instructions',
                      text: text
                    });
                  } else {
                    navigator.clipboard.writeText(text);
                    toast.success('Copied to clipboard!');
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="flex-1 rounded-2xl shadow-sm bg-white mb-4 flex flex-col min-h-[400px]">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading emergency assistant...</p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-[#53B175] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Emergency Instructions */}
                    {msg.emergencyInstructions && msg.emergencyInstructions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Emergency Instructions:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          {msg.emergencyInstructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Safety Tips */}
                    {msg.safetyTips && msg.safetyTips.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Safety Tips:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {msg.safetyTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Video Instructions */}
                    {msg.videos && msg.videos.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-sm mb-2">📹 Video Guides:</p>
                        <div className="space-y-2">
                          {msg.videos.map((video, idx) => (
                            <a
                              key={idx}
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              {video.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Emergency Instructions */}
                    {msg.officialSources && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          📚 Official Emergency Guidelines:
                        </p>
                        <div className="space-y-2">
                          {msg.officialSources.redCross && (
                            <a
                              href={msg.officialSources.redCross}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              🔴 Red Cross Instructions
                            </a>
                          )}
                          {msg.officialSources.fema && (
                            <a
                              href={msg.officialSources.fema}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              🇺🇸 FEMA Guidelines
                            </a>
                          )}
                          {msg.officialSources.usgs && (
                            <a
                              href={msg.officialSources.usgs}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              🌍 USGS Earthquake Info
                            </a>
                          )}
                          {msg.officialSources.kazakhstan && (
                            <a
                              href={msg.officialSources.kazakhstan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              🇰🇿 Kazakhstan Emergency Ministry
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rescue Call Info */}
                    {msg.rescueCall && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="default"
                          className="w-full bg-red-600 hover:bg-red-700"
                          onClick={() => window.open(`tel:${msg.rescueCall!.phoneNumber}`)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call {msg.rescueCall.phoneNumber}
                        </Button>
                        <p className="text-xs mt-2 text-gray-600">Say: &quot;{msg.rescueCall.script}&quot;</p>
                      </div>
                    )}

                    <p className="text-xs opacity-60 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-4 bg-gray-100">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="rounded-2xl shadow-sm bg-white p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about emergency procedures..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#53B175] focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
              className="px-6 py-3 bg-[#53B175] hover:bg-[#4a9c65] text-white rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Ask about safety procedures, evacuation routes, first aid, or shelter locations
          </p>
        </div>
      </div>
    </AppShell>
  );
}

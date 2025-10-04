"use client";
import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/AppShell";
import { 
  CloudSnow, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain,
  TrendingUp,
  Brain,
  Satellite,
  BarChart3,
  FileDown,
  Activity,
  MapPin,
  Search
} from "lucide-react";
import { WiDaySunny, WiHumidity, WiStrongWind, WiRain } from "react-icons/wi";
import { useAppStore } from "@/lib/store/useAppStore";
import { getCurrentLocationWithName, reverseGeocode } from "@/lib/geocoding";
import { useWeatherInsightsStore, WeatherInsight } from "@/lib/store/useWeatherInsightsStore";
import LocationSearch from "@/components/LocationSearch";
import AlertTimerSettings from "@/components/AlertTimerSettings";
import Link from "next/link";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
}

export default function ForecastPage() {
  const { user } = useUser();
  const location = useAppStore((state) => state.location.location);
  const locationName = useAppStore((state) => state.location.locationName);
  const setLocation = useAppStore((state) => state.setLocation);
  const setLocationName = useAppStore((state) => state.setLocationName);
  const setTracking = useAppStore((state) => state.setTracking);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [aiInsights, setAiInsights] = useState<WeatherInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const { addInsight, startConversation } = useWeatherInsightsStore();

  // Request user's location
  const requestLocation = async () => {
    setIsRequestingLocation(true);
    try {
      const result = await getCurrentLocationWithName();
      if (result) {
        setLocation({ lat: result.lat, lng: result.lng }, result.accuracy, result.name);
        setLocationName(result.name);
        setTracking(true);
      }
    } catch (error: any) {
      console.error('Location error:', error);
      let errorMessage = 'Failed to get location. ';
      
      if (error.code === 1) {
        errorMessage += 'Permission denied. Please enable location in your browser settings.';
      } else if (error.code === 2) {
        errorMessage += 'Location unavailable. Check your device settings.';
      } else if (error.code === 3) {
        errorMessage += 'Request timed out. Try again.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Fetch weather data
  const fetchWeatherData = useCallback(async () => {
    if (!location) return;
    
    try {
      const response = await fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}`);
      
      if (response.ok) {
        const data = await response.json();
        
        setWeatherData({
          temperature: Math.round(data.current?.temperature || 22),
          humidity: Math.round(data.current?.humidity || 65),
          windSpeed: Math.round(data.current?.windSpeed || 12),
          precipitation: Math.round(data.current?.precipitation || 15),
          condition: "partly_cloudy"
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Fallback to mock data on error
      setWeatherData({
        temperature: 22,
        humidity: 65,
        windSpeed: 12,
        precipitation: 15,
        condition: "partly_cloudy"
      });
      setIsLoading(false);
    }
  }, [location, locationName]);

  // Load AI Weather Insights
  const loadAIInsights = useCallback(async () => {
    if (!location || !locationName) return;
    
    setIsLoadingInsights(true);
    
    try {
      const insightTypes = ['temperature', 'precipitation', 'general'];
      const insightPromises = insightTypes.map(async (type) => {
        const response = await fetch('/api/forecast/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              lat: location.lat,
              lng: location.lng,
              name: locationName
            },
            type
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            id: `${type}-${Date.now()}-${Math.random()}`,
            type: type as 'temperature' | 'precipitation' | 'general',
            insight: data.insight,
            confidence: data.confidence as 'high' | 'medium' | 'low',
            location: data.location.name || locationName,
            timestamp: data.timestamp,
            nasaData: data.nasaData
          };
        }
        return null;
      });
      
      const results = await Promise.all(insightPromises);
      const validInsights = results.filter(Boolean) as WeatherInsight[];
      
      setAiInsights(validInsights);
      validInsights.forEach(insight => addInsight(insight));
      
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [location, locationName, addInsight]);

  const handleDetailsClick = (insight: WeatherInsight) => {
    startConversation(insight);
    // Navigate to AI chat page with the conversation context
    window.location.href = '/forecast/ai';
  };

  useEffect(() => {
    if (location) {
      setIsLoading(true);
      
      // Get location name if not available
      if (!locationName) {
        reverseGeocode(location.lat, location.lng)
          .then(name => setLocationName(name))
          .catch(console.error);
      }
      
      // Load weather data and AI insights
      fetchWeatherData();
      loadAIInsights();
    }
  }, [location, locationName, fetchWeatherData, loadAIInsights, setLocationName]);

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen">
        {/* Header - Compact version matching dashboard */}
        <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-2">
            <WiDaySunny className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Weather Forecast</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">AI-powered weather intelligence</p>
        </div>

        {/* Emergency/Forecast Toggle */}
        <div className="mb-4 flex justify-center items-center w-full">
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200 mx-auto">
            <div className="flex items-center">
              <Link href="/dashboard" className="px-6 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Emergency
              </Link>
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-[#3B82F6] text-white">
                Forecast
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Weather Insights, {(user as any)?.fullName || "User"}</h2>
          <p className="text-sm text-gray-500">Get intelligent weather predictions with AI analysis and behavior insights.</p>
        </div>

        {/* Current Weather - First Priority Module */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 mb-1 mr-2 text-blue-600">
                <WiDaySunny className="h-6 w-6 text-blue-600" />
              </span>
              <span className="font-bold text-gray-900">Current Weather</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{locationName || "Loading location..."}</span>
            </div>
          </div>
          
          {!location ? (
            <div className="p-6 text-center border rounded-xl bg-blue-50">
              <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 mb-3">Enable location to see current weather</p>
              <button
                onClick={requestLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Enable Location
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-20 bg-blue-50 rounded-xl animate-pulse" />
              <div className="h-20 bg-blue-50 rounded-xl animate-pulse" />
            </div>
          ) : weatherData ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 rounded-xl bg-blue-50">
                <WiDaySunny className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{weatherData.temperature}°C</div>
                <div className="text-xs text-gray-500 capitalize">{weatherData.condition.replace('_', ' ')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50">
                <WiHumidity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{weatherData.humidity}%</div>
                <div className="text-xs text-gray-500">Humidity</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-50">
                <WiStrongWind className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{weatherData.windSpeed} km/h</div>
                <div className="text-xs text-gray-500">Wind Speed</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50">
                <WiRain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{weatherData.precipitation}%</div>
                <div className="text-xs text-gray-500">Precipitation</div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center border rounded-xl bg-gray-50">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Unable to load weather data</p>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Satellite className="h-5 w-5 text-blue-600" />
            Weather Intelligence
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/forecast/map" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Satellite className="h-4 w-4" />
                  <div className="text-sm font-semibold">Interactive Map</div>
                </div>
                <div className="text-xs opacity-90">Real-time weather visualization</div>
              </div>
            </Link>
            
            <Link href="/forecast/ai" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <WiDaySunny className="h-4 w-4" />
                  <div className="text-sm font-semibold">AI Analysis</div>
                </div>
                <div className="text-xs opacity-90">Smart weather predictions & insights</div>
              </div>
            </Link>

            <Link href="/forecast/behavior" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <div className="text-sm font-semibold">Behavior Prediction</div>
                </div>
                <div className="text-xs opacity-90">AI learns your weather patterns</div>
              </div>
            </Link>
            
            <Link href="/forecast/stats" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4" />
                  <div className="text-sm font-semibold">Statistics</div>
                </div>
                <div className="text-xs opacity-90">Historical data & trends</div>
              </div>
            </Link>

            <Link href="/forecast/export" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <FileDown className="h-4 w-4" />
                  <div className="text-sm font-semibold">Export Data</div>
                </div>
                <div className="text-xs opacity-90">Download weather datasets</div>
              </div>
            </Link>

            <Link href="/route" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  <div className="text-sm font-semibold">Smart Route</div>
                </div>
                <div className="text-xs opacity-90">Plan weather-aware routes</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/forecast/map">
            <div className="rounded-2xl bg-[#eff6ff] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
              <Satellite className="h-8 w-8 text-blue-600" />
              <span className="mt-2 text-base font-semibold text-gray-900">Map</span>
            </div>
          </Link>
          <Link href="/forecast/ai">
            <div className="rounded-2xl bg-[#f0f9ff] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
              <WiDaySunny className="h-8 w-8 text-blue-600" />
              <span className="mt-2 text-base font-semibold text-gray-900">AI</span>
            </div>
          </Link>
          <Link href="/forecast/stats">
            <div className="rounded-2xl bg-[#eef2ff] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="mt-2 text-base font-semibold text-gray-900">Stats</span>
            </div>
          </Link>
        </div>

        {/* Current Weather Status */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-6 h-6 text-blue-600">
              <CloudSnow className="w-6 h-6" />
            </span>
            <span className="font-bold text-gray-900">Current Weather</span>
          </div>
          {location && weatherData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  📍 {locationName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLocationSearch(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Change Location
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{weatherData.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{weatherData.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{weatherData.precipitation}%</span>
                </div>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">Weather data active</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Location access required for weather forecasts and AI predictions.
              </p>
              <button 
                onClick={requestLocation}
                disabled={isRequestingLocation}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-base shadow transition-colors"
              >
                {isRequestingLocation ? 'Requesting Location...' : 'Enable Location'}
              </button>
            </div>
          )}
        </div>

        {/* Alert Timer Settings */}
        <div className="mb-6">
          <AlertTimerSettings />
        </div>

        {/* AI Weather Insights */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-4 h-4 mb-3 mr-2 text-blue-600">
              <Brain className="h-6 w-6 text-blue-600" />
            </span>
            <span className="font-bold text-gray-900">AI Weather Insights</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">Intelligent predictions based on your behavior patterns</p>
          {!location ? (
            <div className="p-4 text-center border rounded-xl bg-blue-50">
              <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600">Enable location to start AI weather learning</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-blue-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : isLoadingInsights ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-blue-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="flex items-start justify-between p-4 border rounded-xl bg-blue-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ${
                        insight.type === 'temperature' ? 'bg-blue-600' :
                        insight.type === 'precipitation' ? 'bg-green-600' : 
                        'bg-orange-600'
                      }`}>
                        {insight.type}
                      </span>
                      <Badge variant="outline">{insight.confidence}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {insight.insight.split('\n')[0]}
                    </p>
                    <p className="text-xs text-gray-600">
                      {insight.insight.split('\n')[1] || `AI analysis for ${insight.location}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDetailsClick(insight)}
                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow transition-colors ${
                      insight.type === 'temperature' ? 'bg-blue-600 hover:bg-blue-700' :
                      insight.type === 'precipitation' ? 'bg-green-600 hover:bg-green-700' : 
                      'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center border rounded-xl bg-gray-50">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading weather insights...</p>
            </div>
          )}
        </div>

        {/* Location Search Modal */}
        {showLocationSearch && (
          <LocationSearch
            isOpen={showLocationSearch}
            onClose={() => setShowLocationSearch(false)}
            onLocationSelect={(location) => {
              setLocation({ lat: location.lat, lng: location.lng }, undefined, location.name);
              setLocationName(location.name);
              setShowLocationSearch(false);
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ModeSelector from '@/components/ModeSelector';
import BottomBar, { type ForecastTab } from '@/components/BottomBar';
import EmergencyBottomBar, { type EmergencyTab } from '@/components/EmergencyBottomBar';
import { Home, AlertTriangle, MapPin, MessageCircle, Users, Waves, Flame, Earth, Wind } from 'lucide-react';
import { useForecast } from '@/app/contexts/ForecastContext';
import DaySelector from '@/components/DaySelector';
import ThresholdInput from '@/components/ThresholdInput';
import StatisticsChart from '@/components/StatisticsChart';
import ExportButtons from '@/components/ExportButtons';

const Map = dynamic(() => import('@/components/WeatherMap'), { ssr: false });
const EmergencyMap = dynamic(() => import('@/components/EmergencyMap'), { ssr: false });
const WeatherAnimation = dynamic(() => import('@/components/WeatherAnimation'), { ssr: false });
const ComfortIndex = dynamic(() => import('@/components/ComfortIndex'), { ssr: false });
const RouteAssistant = dynamic(() => import('@/components/RouteAssistant'), { ssr: false });
const AIChat = dynamic(() => import('@/components/AIChat'), { ssr: false });

type AppMode = 'forecast' | 'emergency';

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>('emergency');
  const [forecastTab, setForecastTab] = useState<ForecastTab>('map');
  const [emergencyTab, setEmergencyTab] = useState<EmergencyTab>('map');
  const [emergencyAlertCount] = useState(3);
  
  const { 
    forecastState, 
    aiState,
    setLocation, 
    setDayOfYear,
    setWindowDays,
    setVariable,
    setThreshold,
    loadStatistics,
    askAI
  } = useForecast();
  const location = forecastState.location;

  const handleLoadStatistics = async () => {
    await loadStatistics();
  };

  // Render content based on mode and active tab
  const renderForecastContent = () => {
    switch (forecastTab) {
      case 'map':
        return (
          <div className="space-y-4 animate-fadeIn">
            <Card>
              <CardContent className="pt-6 ">
                <DaySelector
                  dayOfYear={forecastState.day_of_year}
                  windowDays={forecastState.window_days}
                  onDayChange={setDayOfYear}
                  onWindowChange={setWindowDays}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ThresholdInput
                  variable={forecastState.variable}
                  threshold={forecastState.threshold}
                  onVariableChange={setVariable}
                  onThresholdChange={setThreshold}
                />
              </CardContent>
            </Card>

            <Button 
              onClick={handleLoadStatistics}
              disabled={!location || forecastState.loading}
              className="w-full"
              size="lg"
            >
              {forecastState.loading ? 'Analyzing...' : '📊 Load Statistics'}
            </Button>

            {forecastState.error && (
              <Alert variant="destructive">
                <AlertDescription>{forecastState.error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-0">
                <Map
                  onLocationSelect={setLocation}
                  selectedLocation={location}
                  className="h-[400px] rounded-2xl overflow-hidden"
                />
              </CardContent>
            </Card>

            {forecastState.statistics && (
              <>
                <StatisticsChart statistics={forecastState.statistics} />
                <ExportButtons statistics={forecastState.statistics} />
              </>
            )}
          </div>
        );

      case 'animation':
        return (
          <div className="animate-fadeIn">
            <WeatherAnimation
              variable={forecastState.variable}
              currentValue={forecastState.statistics?.mean}
            />
          </div>
        );

      case 'comfort':
        return (
          <div className="animate-fadeIn">
            <ComfortIndex
              temperature={forecastState.statistics?.mean || 22}
              humidity={70}
              windSpeed={5}
            />
          </div>
        );

      case 'ai':
        return (
          <div className="animate-fadeIn">
            <Card>
              <CardHeader>
                <CardTitle>AI Weather Assistant</CardTitle>
                <CardDescription>Ask questions about weather conditions and get AI-powered insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-gray-600 mb-4">
                    Click the AI button in the bottom right to start chatting with ForecastGPT-5
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'route':
        return (
          <div className="animate-fadeIn">
            <RouteAssistant />
          </div>
        );

      default:
        return null;
    }
  };

  const renderEmergencyContent = () => {
    switch (emergencyTab) {
      case 'map':
        return (
          <div className="h-screen animate-fadeIn">
            <EmergencyMap center={location ? [location.lat, location.lon] : undefined} />
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-heavy mb-2">Active Alerts</h2>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <div>
                        <h3 className="font-bold text-lg">Severe Weather Alert #{i}</h3>
                        <p className="text-sm text-gray-600">Active since 2 hours ago</p>
                      </div>
                    </div>
                    <Badge variant="destructive">EXTREME</Badge>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Strong storms approaching the area. Seek shelter immediately.
                  </p>
                  <Button className="w-full">View Details & Safety Instructions</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'nearby':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-heavy mb-2">Nearby Resources</h2>
            {['🏥 Emergency Shelters', '🚑 Medical Centers', '🚒 Fire Stations', '👮 Police Stations'].map((resource, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{resource}</h3>
                    <Badge>Open 24/7</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>📍 Distance: 2.5 km away</p>
                    <p>🕐 Est. time: 8 minutes by car</p>
                    <p>📞 Emergency: +1 (555) 123-4567</p>
                  </div>
                  <Button className="w-full">Get Directions</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-heavy mb-6">Notifications</h2>
            {[
              { icon: '⚠️', title: 'Severe Weather Alert', time: '5 min ago' },
              { icon: '🌊', title: 'Flood Warning Update', time: '1 hour ago' },
              { icon: '🔥', title: 'Wildfire Advisory', time: '2 hours ago' },
              { icon: '✅', title: 'All Clear: Storm Passed', time: '5 hours ago' },
            ].map((notif, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{notif.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold">{notif.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-6 bg-[#F8FAF8] min-h-screen space-y-4">
        {/* Header */}
        <Card className="py-6 px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <svg className="h-8 w-8 text-[#53B175]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 9v12h16V9l-8-7zm0 2.828L18 10v9h-5v-6h-2v6H6v-9l6-5.172z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">resQ</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            {mode === 'emergency' ? 'Emergency alerts & assistance' : 'Weather forecasting & planning'}
          </p>
        </Card>

        {/* Emergency/Forecast Toggle */}
        <div className="flex justify-center items-center w-full">
          <ModeSelector currentMode={mode} onModeChange={setMode} />
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {mode === 'forecast' ? renderForecastContent() : renderEmergencyContent()}
        </div>

      </div>

      {/* AI Chat - Always available */}
      <AIChat
        onQuery={askAI}
        response={aiState.response}
        loading={aiState.loading}
        error={aiState.error}
        weatherData={{
          temperature: forecastState.statistics?.mean,
          location: location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : undefined,
          date: new Date().toLocaleDateString(),
        }}
      />

      {/* Bottom Navigation */}
      {mode === 'forecast' ? (
        <BottomBar activeTab={forecastTab} onTabChange={setForecastTab} />
      ) : (
        <EmergencyBottomBar 
          activeTab={emergencyTab} 
          onTabChange={setEmergencyTab}
          alertCount={emergencyAlertCount}
        />
      )}
    </AppShell>
  );
}

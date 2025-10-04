'use client';

import { useState } from 'react';
import { MapPin, Route, Car, Bike, User, Bus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store/useAppStore';
import LocationSearch from '@/components/LocationSearch';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

interface WeatherRisk {
  type: 'rain' | 'snow' | 'wind' | 'temperature' | 'visibility';
  severity: 'low' | 'medium' | 'high';
  location: string;
  timeWindow: string;
  description: string;
}

interface RouteData {
  route: {
    distance: string;
    duration: string;
    polyline: string;
    steps: Array<{
      instruction: string;
      distance: string;
      duration: string;
      location: { lat: number; lng: number };
    }>;
  };
  weatherRisk: {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: WeatherRisk[];
  };
  recommendations: string[];
}

export default function RoutePage() {
  const { location: userLocation } = useAppStore();
  const [origin, setOrigin] = useState<RoutePoint | null>(
    userLocation.location ? {
      lat: userLocation.location.lat,
      lng: userLocation.location.lng,
      name: userLocation.locationName || 'Current Location'
    } : null
  );
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);

  const travelModes = [
    { value: 'driving' as const, label: 'Driving', icon: Car },
    { value: 'walking' as const, label: 'Walking', icon: User },
    { value: 'bicycling' as const, label: 'Bicycling', icon: Bike },
    { value: 'transit' as const, label: 'Transit', icon: Bus }
  ];

  const calculateRoute = async () => {
    if (!origin || !destination) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          travelMode,
          departureTime: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRouteData(data);
      } else {
        console.error('Failed to calculate route');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'wind': return '💨';
      case 'temperature': return '🌡️';
      case 'visibility': return '🌫️';
      default: return '⚠️';
    }
  };

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen">
        {/* Header */}
        <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Route className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Smart Route Planning</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Weather-aware route optimization
          </p>
        </div>

        {/* Route Planning Form */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Plan Your Route</h2>
          
          {/* Origin */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">From</label>
            <button
              onClick={() => setShowOriginSearch(true)}
              className="w-full p-3 border rounded-xl text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className={origin ? 'text-gray-900' : 'text-gray-400'}>
                {origin?.name || 'Select starting point'}
              </span>
            </button>
          </div>

          {/* Destination */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">To</label>
            <button
              onClick={() => setShowDestinationSearch(true)}
              className="w-full p-3 border rounded-xl text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className={destination ? 'text-gray-900' : 'text-gray-400'}>
                {destination?.name || 'Select destination'}
              </span>
            </button>
          </div>

          {/* Travel Mode */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">Travel Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {travelModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setTravelMode(mode.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      travelMode === mode.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{mode.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateRoute}
            disabled={!origin || !destination || isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Calculating Route...' : 'Calculate Route & Weather Risk'}
          </button>
        </div>

        {/* Route Results */}
        {routeData && (
          <div className="space-y-4">
            {/* Route Summary */}
            <div className="rounded-2xl bg-white shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">Route Summary</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">{routeData.route.distance}</div>
                  <div className="text-sm text-gray-600">Distance</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">{routeData.route.duration}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>
            </div>

            {/* Weather Risk Assessment */}
            <div className="rounded-2xl bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Weather Risk Assessment</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  routeData.weatherRisk.overallRisk === 'high' ? 'bg-red-100 text-red-600' :
                  routeData.weatherRisk.overallRisk === 'medium' ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {routeData.weatherRisk.overallRisk.toUpperCase()} RISK
                </span>
              </div>

              {routeData.weatherRisk.riskFactors.length > 0 ? (
                <div className="space-y-3">
                  {routeData.weatherRisk.riskFactors.map((risk, index) => (
                    <div key={index} className={`p-3 rounded-lg ${getRiskColor(risk.severity)}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getRiskIcon(risk.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{risk.type} Alert</div>
                          <div className="text-sm">{risk.description}</div>
                          <div className="text-xs mt-1 opacity-75">
                            {risk.location} • {risk.timeWindow}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="text-sm">Clear weather conditions expected</div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {routeData.recommendations.length > 0 && (
              <div className="rounded-2xl bg-white shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">Travel Recommendations</h3>
                <div className="space-y-2">
                  {routeData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50">
                      <div className="text-blue-600 mt-0.5">💡</div>
                      <div className="text-sm text-gray-700">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Steps */}
            <div className="rounded-2xl bg-white shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">Route Directions</h3>
              <div className="space-y-3">
                {routeData.route.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.instruction}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {step.distance} • {step.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location Search Modals */}
        {showOriginSearch && (
          <LocationSearch
            isOpen={showOriginSearch}
            onClose={() => setShowOriginSearch(false)}
            onLocationSelect={(location) => {
              setOrigin({ lat: location.lat, lng: location.lng, name: location.name });
              setShowOriginSearch(false);
            }}
          />
        )}

        {showDestinationSearch && (
          <LocationSearch
            isOpen={showDestinationSearch}
            onClose={() => setShowDestinationSearch(false)}
            onLocationSelect={(location) => {
              setDestination({ lat: location.lat, lng: location.lng, name: location.name });
              setShowDestinationSearch(false);
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
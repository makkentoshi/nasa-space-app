"use client";

import React, { useState } from 'react';

interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  time?: string;
}

interface WeatherAlongRoute {
  location: string;
  time: string;
  temperature: number;
  precipitation: number;
  conditions: string;
  warnings?: string[];
}

interface PackingRecommendation {
  category: 'Essential' | 'Recommended' | 'Optional';
  items: string[];
  reason: string;
}

export default function RouteAssistant() {
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([]);
  const [departureTime, setDepartureTime] = useState<string>('');
  const [transportMode, setTransportMode] = useState<'car' | 'walk' | 'bike' | 'transit'>('car');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [routeWeather, setRouteWeather] = useState<WeatherAlongRoute[]>([]);
  const [packingList, setPackingList] = useState<PackingRecommendation[]>([]);

  const analyzeRoute = async () => {
    setIsAnalyzing(true);
    
    // TODO: Implement actual route weather analysis
    // Mock data for now
    setTimeout(() => {
      setRouteWeather([
        {
          location: 'Start Point',
          time: '10:00 AM',
          temperature: 22,
          precipitation: 0,
          conditions: 'Clear',
        },
        {
          location: 'Midpoint',
          time: '12:00 PM',
          temperature: 25,
          precipitation: 20,
          conditions: 'Partly Cloudy',
          warnings: ['Light rain expected'],
        },
        {
          location: 'Destination',
          time: '2:00 PM',
          temperature: 23,
          precipitation: 40,
          conditions: 'Rain',
          warnings: ['Moderate rain', 'Reduced visibility'],
        },
      ]);

      setPackingList([
        {
          category: 'Essential',
          items: ['Umbrella', 'Rain jacket', 'Water bottle', 'Phone charger'],
          reason: 'Rain expected along route',
        },
        {
          category: 'Recommended',
          items: ['Sunglasses', 'Sunscreen', 'Light jacket', 'Snacks'],
          reason: 'Variable weather conditions',
        },
        {
          category: 'Optional',
          items: ['Change of clothes', 'Towel', 'Extra shoes'],
          reason: 'In case of heavy rain',
        },
      ]);

      setIsAnalyzing(false);
    }, 2000);
  };

  const addWaypoint = () => {
    const newWaypoint: RoutePoint = {
      id: `waypoint-${Date.now()}`,
      name: '',
      lat: 0,
      lon: 0,
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-heavy mb-2">Route Assistant</h1>
          <p className="text-gray-600">Plan your route with weather insights and packing recommendations</p>
        </div>

        {/* Route Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-heavy mb-4">Route Details</h2>
          
          {/* Start Point */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Starting Point
            </label>
            <input
              type="text"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              placeholder="Enter starting location"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Waypoints */}
          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="mb-4 flex gap-2">
              <input
                type="text"
                value={waypoint.name}
                onChange={(e) => {
                  const updated = [...waypoints];
                  updated[index].name = e.target.value;
                  setWaypoints(updated);
                }}
                placeholder={`Waypoint ${index + 1}`}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => removeWaypoint(waypoint.id)}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addWaypoint}
            className="w-full px-4 py-3 mb-4 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300"
          >
            + Add Waypoint
          </button>

          {/* End Point */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Destination
            </label>
            <input
              type="text"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              placeholder="Enter destination"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Departure Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🕐 Departure Time
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Transport Mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚗 Transport Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mode: 'car' as const, icon: '🚗', label: 'Car' },
                { mode: 'walk' as const, icon: '🚶', label: 'Walk' },
                { mode: 'bike' as const, icon: '🚴', label: 'Bike' },
                { mode: 'transit' as const, icon: '🚌', label: 'Transit' },
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setTransportMode(mode)}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    transportMode === mode
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeRoute}
            disabled={!startPoint || !endPoint || isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              !startPoint || !endPoint || isAnalyzing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing Route...
              </span>
            ) : (
              '🔍 Analyze Route & Get Recommendations'
            )}
          </button>
        </div>

        {/* Weather Along Route */}
        {routeWeather.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-heavy mb-4">Weather Along Route</h2>
            <div className="space-y-3">
              {routeWeather.map((weather, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{weather.location}</h3>
                      <p className="text-sm text-gray-600">{weather.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-heavy">{weather.temperature}°C</p>
                      <p className="text-sm text-gray-600">{weather.conditions}</p>
                    </div>
                  </div>
                  
                  {weather.precipitation > 0 && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                      <span>💧</span>
                      <span>{weather.precipitation}% chance of rain</span>
                    </div>
                  )}
                  
                  {weather.warnings && weather.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {weather.warnings.map((warning, wIndex) => (
                        <div key={wIndex} className="flex items-center gap-2 text-sm text-orange-600">
                          <span>⚠️</span>
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packing Recommendations */}
        {packingList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-heavy mb-4">🎒 What to Bring</h2>
            <div className="space-y-4">
              {packingList.map((recommendation, index) => (
                <div key={index} className="border-l-4 pl-4" style={{
                  borderColor: recommendation.category === 'Essential' ? '#34C759' :
                               recommendation.category === 'Recommended' ? '#007AFF' : '#8E8E93'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{recommendation.category}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {recommendation.items.length} items
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{recommendation.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.items.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="px-3 py-1 bg-gray-50 rounded-lg text-sm text-gray-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface EmergencyEvent {
  id: string;
  type: 'earthquake' | 'flood' | 'wildfire' | 'hurricane' | 'tornado' | 'tsunami' | 'volcano' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description: string;
  lat: number;
  lon: number;
  radius: number; // km
  timestamp: string;
  affectedAreas: string[];
  casualties?: number;
  status: 'active' | 'watch' | 'warning' | 'past';
  source: string;
}

interface EmergencyMapProps {
  center?: LatLngExpression;
  className?: string;
}

export default function EmergencyMap({ 
  center = [0, 0] as LatLngExpression,
  className = '' 
}: EmergencyMapProps) {
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EmergencyEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<EmergencyEvent[]>([]);

  // Mock emergency events data
  useEffect(() => {
    // TODO: Replace with actual emergency data API
    const mockEvents: EmergencyEvent[] = [
      {
        id: '1',
        type: 'earthquake',
        severity: 'extreme',
        title: 'Major Earthquake - 7.2 Magnitude',
        description: 'Strong earthquake detected. Aftershocks expected.',
        lat: 35.6762,
        lon: 139.6503,
        radius: 100,
        timestamp: new Date().toISOString(),
        affectedAreas: ['Tokyo', 'Yokohama', 'Kawasaki'],
        casualties: 50,
        status: 'active',
        source: 'USGS',
      },
      {
        id: '2',
        type: 'flood',
        severity: 'high',
        title: 'Severe Flooding',
        description: 'Heavy rainfall causing widespread flooding.',
        lat: 29.7604,
        lon: -95.3698,
        radius: 50,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        affectedAreas: ['Houston', 'Galveston'],
        status: 'warning',
        source: 'NOAA',
      },
      {
        id: '3',
        type: 'wildfire',
        severity: 'extreme',
        title: 'Wildfire - Evacuations Ordered',
        description: 'Fast-moving wildfire threatening residential areas.',
        lat: 34.0522,
        lon: -118.2437,
        radius: 30,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        affectedAreas: ['Los Angeles County', 'Malibu'],
        status: 'active',
        source: 'CAL FIRE',
      },
      {
        id: '4',
        type: 'hurricane',
        severity: 'extreme',
        title: 'Hurricane Category 4',
        description: 'Major hurricane approaching coastline.',
        lat: 25.7617,
        lon: -80.1918,
        radius: 200,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        affectedAreas: ['Miami', 'Fort Lauderdale', 'Palm Beach'],
        status: 'warning',
        source: 'NHC',
      },
    ];
    setEvents(mockEvents);
  }, []);

  // Get user location and check nearby alerts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(userLoc);
        
        // Calculate nearby events (within 100km)
        const nearby = events.filter(event => {
          const distance = calculateDistance(
            userLoc[0], userLoc[1],
            event.lat, event.lon
          );
          return distance <= 100;
        });
        setNearbyAlerts(nearby);
      });
    }
  }, [events]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get event color based on type and severity
  const getEventColor = (type: string, severity: string): string => {
    const colors = {
      earthquake: '#8B4513',
      flood: '#1E90FF',
      wildfire: '#FF4500',
      hurricane: '#4B0082',
      tornado: '#696969',
      tsunami: '#00CED1',
      volcano: '#DC143C',
      other: '#808080',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  // Get event icon
  const getEventIcon = (type: string): string => {
    const icons = {
      earthquake: '🌍',
      flood: '🌊',
      wildfire: '🔥',
      hurricane: '🌀',
      tornado: '🌪️',
      tsunami: '🌊',
      volcano: '🌋',
      other: '⚠️',
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  return (
    <div className={`relative ${className}`}>
      {/* Nearby Alerts Banner */}
      {nearbyAlerts.length > 0 && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-500 text-white rounded-xl shadow-lg p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold">Emergency Alert Nearby</p>
                <p className="text-sm opacity-90">{nearbyAlerts.length} active event(s) within 100km</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-red-500 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-4 max-w-xs">
        <h3 className="font-bold text-gray-900 mb-3">Filters</h3>
        
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Event Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="earthquake">🌍 Earthquake</option>
            <option value="flood">🌊 Flood</option>
            <option value="wildfire">🔥 Wildfire</option>
            <option value="hurricane">🌀 Hurricane</option>
            <option value="tornado">🌪️ Tornado</option>
            <option value="tsunami">🌊 Tsunami</option>
            <option value="volcano">🌋 Volcano</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="extreme">⚠️ Extreme</option>
          </select>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* User Location */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={100000} // 100km
            pathOptions={{ color: '#34C759', fillColor: '#34C759', fillOpacity: 0.1 }}
          />
        )}

        {/* Emergency Events */}
        {filteredEvents.map((event) => (
          <React.Fragment key={event.id}>
            {/* Affected Area Circle */}
            <Circle
              center={[event.lat, event.lon]}
              radius={event.radius * 1000}
              pathOptions={{
                color: getEventColor(event.type, event.severity),
                fillColor: getEventColor(event.type, event.severity),
                fillOpacity: 0.2,
                weight: 2,
              }}
            />

            {/* Event Marker */}
            <Marker
              position={[event.lat, event.lon]}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getEventIcon(event.type)}</span>
                    <div>
                      <h3 className="font-bold text-sm">{event.title}</h3>
                      <p className="text-xs text-gray-600 capitalize">{event.severity} • {event.status}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{event.description}</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>📍 Affected: {event.affectedAreas.join(', ')}</p>
                    <p>🕐 {new Date(event.timestamp).toLocaleString()}</p>
                    <p>📡 Source: {event.source}</p>
                    {event.casualties && <p className="text-red-600 font-bold">⚠️ Casualties: {event.casualties}</p>}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Event Details Panel */}
      {selectedEvent && (
        <div className="absolute bottom-24 left-4 right-4 z-[1000] bg-white rounded-2xl shadow-2xl p-6 max-h-64 overflow-y-auto">
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>

          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">{getEventIcon(selectedEvent.type)}</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-heavy mb-1">{selectedEvent.title}</h3>
              <div className="flex gap-2 text-sm">
                <span className={`px-2 py-1 rounded-lg font-medium ${
                  selectedEvent.severity === 'extreme' ? 'bg-red-100 text-red-700' :
                  selectedEvent.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                  selectedEvent.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedEvent.severity.toUpperCase()}
                </span>
                <span className="px-2 py-1 rounded-lg font-medium bg-gray-100 text-gray-700 capitalize">
                  {selectedEvent.status}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{selectedEvent.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span>📍</span>
              <div>
                <p className="font-medium">Affected Areas:</p>
                <p className="text-gray-600">{selectedEvent.affectedAreas.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <p className="text-gray-600">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span>📡</span>
              <p className="text-gray-600">Source: {selectedEvent.source}</p>
            </div>
            {selectedEvent.casualties && (
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <span>⚠️</span>
                <p>Casualties Reported: {selectedEvent.casualties}</p>
              </div>
            )}
          </div>

          <button className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
            Get Safety Instructions
          </button>
        </div>
      )}
    </div>
  );
}

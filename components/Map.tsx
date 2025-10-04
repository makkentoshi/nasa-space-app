"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { Location } from '@/app/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface MapProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location;
  className?: string;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (location: Location) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect({ lat, lon: lng });
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function Map({ onLocationSelect, selectedLocation, className = '' }: MapProps) {
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York
  const defaultZoom = 10;

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]} />
        )}
      </MapContainer>
      
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm font-semibold">Selected Location:</p>
          <p className="text-xs text-gray-600">
            Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}
          </p>
          {selectedLocation.place_name && (
            <p className="text-xs text-gray-800 mt-1">{selectedLocation.place_name}</p>
          )}
        </div>
      )}
    </div>
  );
}

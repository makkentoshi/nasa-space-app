"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

interface RoutePoint {
  lat: number
  lng: number
  name: string
}

interface LocaitonMapProps {
  origin?: RoutePoint | null
  destination?: RoutePoint | null
  polyline?: string
  className?: string
  height?: string
}

export default function LocaitonMap({ 
  origin,
  destination,
  polyline,
  className = '',
  height = '400px'
}: LocaitonMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Card className="h-full w-full">
        <CardContent className="flex h-full items-center justify-center p-6">
          <div className="text-center w-full">
            <Navigation className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">Route Map Placeholder</h3>
            
            {origin && (
              <div className="mb-3 p-3 bg-green-50 rounded-lg text-left">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Origin</span>
                </div>
                <p className="text-xs text-gray-600">{origin.name}</p>
                <p className="text-xs text-gray-500">
                  {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                </p>
              </div>
            )}

            {destination && (
              <div className="mb-3 p-3 bg-red-50 rounded-lg text-left">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Destination</span>
                </div>
                <p className="text-xs text-gray-600">{destination.name}</p>
                <p className="text-xs text-gray-500">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </p>
              </div>
            )}

            {!origin && !destination && (
              <p className="text-sm text-gray-500 mb-2">
                No route selected yet
              </p>
            )}

            {polyline && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                Route polyline: {polyline.substring(0, 30)}...
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Map component placeholder - replace with full Leaflet/Google Maps implementation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

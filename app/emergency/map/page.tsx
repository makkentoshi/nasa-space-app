"use client"

import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  Navigation,
  Phone,
  Radio,
  Shield,
  Waves
} from 'lucide-react'
import { useState, useEffect } from 'react'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { reverseGeocode } from '@/lib/geocoding'

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

// Create custom marker icons using Lucide React icons and data URLs
const createCustomIcon = (color: string, iconType: 'user' | 'family' | 'emergency') => {
  if (typeof window === 'undefined') return undefined
  
  const L = require('leaflet')
  
  // Create SVG icons based on type
  let svgIcon = ''
  if (iconType === 'user') {
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2 L12 12 L16 8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
  } else if (iconType === 'family') {
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21 C6 17 8 15 12 15 C16 15 18 17 18 21" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
  } else {
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z"/></svg>`
  }
  
  const iconUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`
  
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}


const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

interface FamilyMember {
  id: string
  name: string
  relation: string
  phone: string
  location: {
    lat: number
    lng: number
    name: string
  }
  status: 'safe' | 'at-risk' | 'unknown'
  lastSeen: string
}

interface EmergencyZone {
  id: string
  type: 'earthquake' | 'tsunami' | 'fire' | 'flood'
  location: {
    lat: number
    lng: number
    name: string
  }
  magnitude?: number
  severity: 'extreme' | 'severe' | 'moderate' | 'minor'
  radius: number // in meters
  time: string
}

// Mock family data (in production, fetch from /api/friends)
const mockFamily: FamilyMember[] = [
  {
    id: 'f1',
    name: 'Aigerim Nurlanova',
    relation: 'Mother',
    phone: '+7 701 234 5678',
    location: { lat: 51.1605, lng: 71.4704, name: 'Astana, Esil District' },
    status: 'safe',
    lastSeen: '2 minutes ago'
  },
  {
    id: 'f2',
    name: 'Nurlan Akhmetov',
    relation: 'Father',
    phone: '+7 701 234 5679',
    location: { lat: 51.1290, lng: 71.4305, name: 'Astana, Saryarka District' },
    status: 'safe',
    lastSeen: '5 minutes ago'
  },
  {
    id: 'f3',
    name: 'Dana Nurlanova',
    relation: 'Sister',
    phone: '+7 701 234 5680',
    location: { lat: 43.2566, lng: 76.9286, name: 'Almaty, Almaly District' },
    status: 'unknown',
    lastSeen: '2 hours ago'
  },
  {
    id: 'f4',
    name: 'Erlan Nurlanov',
    relation: 'Brother',
    phone: '+7 701 234 5681',
    location: { lat: 51.1180, lng: 71.3980, name: 'Astana, Almaty District' },
    status: 'at-risk',
    lastSeen: '30 minutes ago'
  }
]

export default function EmergencyMapPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState({ lat: 52.2873, lng: 76.9674 }) // Pavlodar
  const [locationName, setLocationName] = useState<string>('Loading location...')
  const [notificationRadius, setNotificationRadius] = useState(50000) // 50km in meters
  const [family, setFamily] = useState<FamilyMember[]>(mockFamily)
  const [emergencyZones, setEmergencyZones] = useState<EmergencyZone[]>([])
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setUserLocation({ lat, lng })
          
          // Get city and country name
          const name = await reverseGeocode(lat, lng)
          setLocationName(name)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationName('Pavlodar, Kazakhstan')
        }
      )
    } else {
      setLocationName('Pavlodar, Kazakhstan')
    }

    // Fetch emergency data
    fetchEmergencyData()
    setMapReady(true)
  }, [])

  const fetchEmergencyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/emergency/data?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=500&minMagnitude=4.0&days=7`
      )
      const data = await response.json()
      
      if (data.success && data.alerts) {
        // Transform alerts to emergency zones
        const zones: EmergencyZone[] = data.alerts.map((alert: any) => ({
          id: alert.id,
          type: alert.type.toLowerCase() as 'earthquake' | 'tsunami',
          location: alert.location,
          magnitude: alert.magnitude,
          severity: alert.severity.toLowerCase() as 'extreme' | 'severe' | 'moderate' | 'minor',
          radius: getSeverityRadius(alert.severity),
          time: alert.time
        }))
        setEmergencyZones(zones)
      }
    } catch (error) {
      console.error('Failed to fetch emergency data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityRadius = (severity: string): number => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 100000 // 100km
      case 'severe': return 50000   // 50km
      case 'moderate': return 25000 // 25km
      case 'minor': return 10000    // 10km
      default: return 10000
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'extreme': return '#dc2626' // red-600
      case 'severe': return '#ea580c'  // orange-600
      case 'moderate': return '#f59e0b' // amber-500
      case 'minor': return '#eab308'   // yellow-500
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'safe': return 'bg-green-500'
      case 'at-risk': return 'bg-red-500'
      case 'unknown': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const safeCount = family.filter(f => f.status === 'safe').length
  const atRiskCount = family.filter(f => f.status === 'at-risk').length
  const unknownCount = family.filter(f => f.status === 'unknown').length

  return (
    <AppShell>
      <div className="min-h-screen bg-pwa-bg2 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-4 relative pt-4">
            <BackButton onClick={() => router.back()} />
            <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-[#53B175]" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Emergency Map</h1>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Track family locations and nearby emergency zones in real-time
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Card className="rounded-2xl shadow-sm bg-white">
              <CardContent className="p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-[#53B175]" />
                <div className="text-xl font-bold text-gray-900">
                  {family.length}
                </div>
                <div className="text-xs text-gray-600">
                  Tracked
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm bg-white">
              <CardContent className="p-3 text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-[#53B175]" />
                <div className="text-xl font-bold text-[#53B175]">
                  {safeCount}
                </div>
                <div className="text-xs text-gray-600">
                  Safe
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm bg-white">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-gray-900" />
                <div className="text-xl font-bold text-gray-900">
                  {atRiskCount}
                </div>
                <div className="text-xs text-gray-600">
                  At Risk
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm bg-white">
              <CardContent className="p-3 text-center">
                <Waves className="w-5 h-5 mx-auto mb-1 text-gray-900" />
                <div className="text-xl font-bold text-gray-900">
                  {emergencyZones.length}
                </div>
                <div className="text-xs text-gray-600">
                  Zones
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Radius Control */}
          <Card className="mb-4 rounded-2xl shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#53B175]" />
                  <span className="font-semibold text-gray-900">Notification Radius</span>
                </div>
                <Badge variant="outline" className="border-[#53B175] text-[#53B175]">
                  {(notificationRadius / 1000).toFixed(0)} km
                </Badge>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="10000"
                value={notificationRadius}
                onChange={(e) => setNotificationRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#53B175]"
                style={{
                  background: `linear-gradient(to right, #53B175 0%, #53B175 ${((notificationRadius - 10000) / 190000) * 100}%, #e5e7eb ${((notificationRadius - 10000) / 190000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <p className="text-xs text-gray-600 mt-2">
                You'll receive alerts for emergencies within this radius
              </p>
            </CardContent>
          </Card>

          {/* Location Status */}
          <Card className="mb-4 rounded-2xl shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#53B175]" />
                <span className="font-semibold text-gray-900">Location Status</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Coordinates:</span> {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {locationName}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="mb-4 rounded-2xl shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              {mapReady && typeof window !== 'undefined' && (
                <div style={{ height: '500px', width: '100%' }}>
                  <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={7}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                      minZoom={3}
                      tileSize={256}
                      keepBuffer={10}
                      updateWhenZooming={false}
                      updateWhenIdle={true}
                    />

                    {/* User location with notification radius */}
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={notificationRadius}
                      pathOptions={{ 
                        color: '#8b5cf6', 
                        fillColor: '#8b5cf6',
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                      }}
                    />
                    
                    <Marker 
                      position={[userLocation.lat, userLocation.lng]}
                      icon={createCustomIcon('#8b5cf6', 'user')}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>Your Location</strong>
                          <p className="text-sm">Notification Zone: {(notificationRadius / 1000).toFixed(0)} km</p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Family members */}
                    {family.map((member) => {
                      const iconColor = member.status === 'safe' ? '#10b981' : 
                                       member.status === 'at-risk' ? '#ef4444' : '#9ca3af'
                      return (
                        <Marker
                          key={member.id}
                          position={[member.location.lat, member.location.lng]}
                          icon={createCustomIcon(iconColor, 'family')}
                        >
                          <Popup>
                            <div>
                              <strong>{member.name}</strong>
                              <p className="text-sm">{member.relation}</p>
                              <p className="text-xs text-gray-600">{member.location.name}</p>
                              <p className="text-xs">Status: <span className={`font-semibold ${
                                member.status === 'safe' ? 'text-green-600' :
                                member.status === 'at-risk' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>{member.status}</span></p>
                              <p className="text-xs">Last seen: {member.lastSeen}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}

                    {/* Emergency zones */}
                    {emergencyZones.map((zone) => (
                      <Circle
                        key={zone.id}
                        center={[zone.location.lat, zone.location.lng]}
                        radius={zone.radius}
                        pathOptions={{
                          color: getSeverityColor(zone.severity),
                          fillColor: getSeverityColor(zone.severity),
                          fillOpacity: 0.2,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div>
                            <strong className="capitalize">{zone.type}</strong>
                            {zone.magnitude && <p className="text-sm">Magnitude: {zone.magnitude}</p>}
                            <p className="text-sm capitalize">Severity: {zone.severity}</p>
                            <p className="text-xs text-gray-600">{zone.location.name}</p>
                            <p className="text-xs">Radius: {(zone.radius / 1000).toFixed(0)} km</p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </MapContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family List */}
          <Card className="rounded-2xl shadow-sm bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-900">
                <Users className="w-5 h-5 text-[#53B175]" />
                Family Members
              </h3>
              <div className="space-y-3">
                {family.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                      <div>
                        <div className="font-semibold text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">
                          {member.relation} • {member.lastSeen}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#53B175] text-[#53B175] hover:bg-[#53B175] hover:text-white"
                        onClick={() => window.open(`tel:${member.phone}`)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                        onClick={() => {
                          // Center map on member
                          setUserLocation({
                            lat: member.location.lat,
                            lng: member.location.lng
                          })
                        }}
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { AppShell } from '@/components/layout/AppShell'
import WeatherMap from '@/components/WeatherMap'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, Brain, Target, Calendar, Clock, Navigation, BarChart3, Eye
} from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { toast } from 'sonner'

export default function ForecastMapPage() {
  const router = useRouter()
  const { user } = useUser()
  const location = useAppStore(state => state.location.location)
  const locationName = useAppStore(state => state.location.locationName)
  
  // Initialize with user's current location if available, otherwise default to Astana
  const [selectedLocation, setSelectedLocation] = useState(
    location ? { lat: location.lat, lng: location.lng } : { lat: 51.1694, lng: 71.4491 }
  )
  const [localLocationName, setLocalLocationName] = useState(locationName || 'Astana, Kazakhstan')
  const [localTime, setLocalTime] = useState<string>('')
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false)
  const [comfortIndex, setComfortIndex] = useState<number | null>(null)
  const [aiAdvice, setAiAdvice] = useState('')

  useEffect(() => {
    const savedTracking = localStorage.getItem('weatherTrackingEnabled')
    if (savedTracking === 'true') {
      setIsTrackingEnabled(true)
    }
  }, [])

  useEffect(() => {
    const updateLocalTime = () => {
      const now = new Date()
      setLocalTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }
    updateLocalTime()
    const interval = setInterval(updateLocalTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Update selected location when user location changes
  useEffect(() => {
    if (location) {
      setSelectedLocation({ lat: location.lat, lng: location.lng })
      if (locationName) {
        setLocalLocationName(locationName)
      } else {
        reverseGeocode({ lat: location.lat, lng: location.lng })
      }
    }
  }, [location, locationName])

  const reverseGeocode = async (coords: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `/api/geocode?lat=${coords.lat}&lng=${coords.lng}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || data.address.state
          const country = data.address.country
          const name = city ? `${city}, ${country}` : `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
          setLocalLocationName(name)
        } else {
          setLocalLocationName(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
        }
      } else {
        setLocalLocationName(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      setLocalLocationName(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
    }
  }

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setSelectedLocation(location)
    await reverseGeocode(location)
    fetchAIAdvice(location)
    await calculateComfortIndex(location)
  }

  const fetchAIAdvice = async (location: { lat: number; lng: number }) => {
    try {
      const response = await fetch('/api/forecast/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "Provide human-like weather advice for this location",
          location: {
            lat: location.lat,
            lng: location.lng,
            name: `${location.lat}, ${location.lng}`
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiAdvice(data.data?.recommendation || data.recommendation || 'AI advice not available')
      }
    } catch (error) {
      console.error('Failed to fetch AI advice:', error)
    }
  }

  const calculateComfortIndex = useCallback(async (location: { lat: number; lng: number }) => {
    try {
      setComfortIndex(null)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const url = `/api/weather?lat=${location.lat}&lng=${location.lng}&units=metric`
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (!data.current || typeof data.current !== 'object') {
          setComfortIndex(5)
          return
        }

        const temp = data.current.temperature ?? 20
        const precipitation = data.current.precipitation ?? 0
        const humidity = data.current.humidity ?? 50
        const windSpeed = data.current.windSpeed ?? 0
        const uvIndex = data.current.uvIndex ?? 5
        const cloudCover = data.current.cloud_cover ?? 50

        const weights = { temperature: 0.25, precipitation: 0.25, humidity: 0.15, wind: 0.15, uv: 0.1, cloud: 0.1 }
        
        let tempScore = 10
        if (temp < 15 || temp > 28) tempScore = Math.max(4, 10 - Math.abs(temp - 21.5) * 0.5)

        const precipScore = precipitation === 0 ? 10 : Math.max(2, 10 - precipitation * 2)
        
        let humScore = 10
        if (humidity < 30 || humidity > 70) humScore = Math.max(5, 10 - Math.abs(humidity - 50) * 0.15)

        const windScore = windSpeed < 5 ? 10 : Math.max(4, 10 - windSpeed * 0.5)
        const uvScore = uvIndex <= 5 ? 10 : Math.max(3, 10 - (uvIndex - 5) * 1.5)
        
        let cloudScore = 10
        if (cloudCover < 20) cloudScore = 8 + (cloudCover / 20) * 2
        else if (cloudCover > 50) cloudScore = Math.max(5, 10 - ((cloudCover - 50) * 0.1))

        const totalWeight = weights.temperature + weights.precipitation + weights.humidity + weights.wind + weights.uv + weights.cloud
        const weightedSum = (
          tempScore * weights.temperature +
          precipScore * weights.precipitation +
          humScore * weights.humidity +
          windScore * weights.wind +
          uvScore * weights.uv +
          cloudScore * weights.cloud
        )

        const comfort = Math.round(weightedSum / totalWeight)
        const finalComfort = Math.max(0, Math.min(10, comfort))
        setComfortIndex(finalComfort)
      } else {
        setComfortIndex(5)
      }
    } catch (error: any) {
      console.error('Comfort index calculation failed:', error)
      setComfortIndex(5)
    }
  }, [])

  const enableLocationTracking = () => {
    setIsTrackingEnabled(true)
    localStorage.setItem('weatherTrackingEnabled', 'true')
    toast.success('Location tracking enabled')
  }

  const disableLocationTracking = () => {
    setIsTrackingEnabled(false)
    localStorage.removeItem('weatherTrackingEnabled')
    toast.info('Location tracking disabled')
  }

  const getComfortColor = (index: number | null) => {
    if (index === null) return 'gray'
    if (index <= 3) return 'red'
    if (index <= 6) return 'yellow'
    if (index <= 8) return 'green'
    return 'blue'
  }

  const getComfortLabel = (index: number | null) => {
    if (index === null) return 'Calculating...'
    if (index <= 3) return 'Uncomfortable'
    if (index <= 6) return 'Moderate'
    if (index <= 8) return 'Comfortable'
    return 'Excellent'
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <BackButton onClick={() => router.back()} />
        
        <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-[#3B82F6]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Weather Intelligence Map</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">AI-powered weather insights for your location</p>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Target className="h-4 w-4" />
                <span>Comfort Index</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${getComfortColor(comfortIndex)}-400`} />
                <span className="font-bold text-gray-900">{comfortIndex || '...'}/10</span>
                <span className="text-xs text-gray-500">{getComfortLabel(comfortIndex)}</span>
              </div>
            </div>

            <div 
              className="rounded-2xl bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={isTrackingEnabled ? disableLocationTracking : enableLocationTracking}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Navigation className="h-4 w-4" />
                <span>Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isTrackingEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-900">
                  {isTrackingEnabled ? 'Active' : 'Tap to Enable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {aiAdvice && (
          <div className="p-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Weather Advisor:</strong> {aiAdvice}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!isTrackingEnabled && (
          <div className="p-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900">Enable Smart Weather Tracking</h3>
                    <p className="text-sm text-orange-700 mt-1 mb-3">
                      Get proactive weather alerts for your daily routes with personalized AI recommendations.
                    </p>
                    <Button onClick={enableLocationTracking} className="bg-orange-600 hover:bg-orange-700 text-white">
                      Enable Tracking
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="p-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Current Location</span>
                </div>
                <div className="text-lg font-semibold text-blue-800">{localLocationName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Latitude</label>
                  <div className="text-lg font-mono bg-gray-50 rounded p-2">
                    {selectedLocation.lat.toFixed(6)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Longitude</label>
                  <div className="text-lg font-mono bg-gray-50 rounded p-2">
                    {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Local time: {localTime}</span>
              </div>

              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                <Calendar className="h-3 w-3" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'short', day: 'numeric' 
                })}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 p-4">
          <WeatherMap
            initialLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            height="calc(100vh - 400px)"
            showControls={true}
          />
        </div>

        <div className="p-4 bg-white border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/forecast/ai')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Analysis
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/forecast/stats')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Weather Stats
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

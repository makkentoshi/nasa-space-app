"use client"

// Ensure Leaflet CSS is bundled when using react-leaflet (robust fallback to dynamic link)
import 'leaflet/dist/leaflet.css'

import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { MapPin, Layers, Download, Play, Pause, Cloud, CloudRain, Thermometer, Wind, Droplets, Sun, Calendar, type LucideIcon } from 'lucide-react'
import L from 'leaflet'
import MapEventHandler from './MapEventHandler'
import { useMap } from 'react-leaflet'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
)


const Rectangle = dynamic(
  () => import('react-leaflet').then(mod => mod.Rectangle),
  { ssr: false }
)

const Polygon = dynamic(
  () => import('react-leaflet').then(mod => mod.Polygon),
  { ssr: false }
)

// NASA IMERG style color scales - Based on official NASA color schemes
const NASA_COLOR_SCALES = {
  precipitation: [
    { value: 0, color: '#E6F7FF', opacity: 0.15 },     // No precipitation - very light blue (visible over light tiles)
    { value: 0.1, color: '#C6E8F0', opacity: 0.4 },    // Very light - pale blue
    { value: 0.5, color: '#6FB7D3', opacity: 0.5 },    // Light - light blue  
    { value: 1.0, color: '#4A90A4', opacity: 0.6 },    // Light-moderate - blue
    { value: 2.5, color: '#2E8B57', opacity: 0.7 },    // Moderate - green
    { value: 5.0, color: '#ADFF2F', opacity: 0.7 },    // Moderate-heavy - lime
    { value: 10.0, color: '#FFFF00', opacity: 0.8 },   // Heavy - yellow
    { value: 25.0, color: '#FFA500', opacity: 0.8 },   // Very heavy - orange
    { value: 50.0, color: '#FF4500', opacity: 0.9 },   // Extreme - red-orange
    { value: 100.0, color: '#8B0000', opacity: 1.0 }   // Extreme+ - dark red
  ],
  temperature: [
    { value: -30, color: '#000080', opacity: 0.9 },    // Extreme cold - navy
    { value: -25, color: '#0000FF', opacity: 0.85 },    // Very cold - blue
    { value: -20, color: '#4169E1', opacity: 0.8 },    // Cold - royal blue
    { value: -15, color: '#1E90FF', opacity: 0.75 },
    { value: -10, color: '#87CEEB', opacity: 0.7 },      
    { value: -5, color: '#7FFFD4', opacity: 0.65 },
    { value: 0, color: '#90EE90', opacity: 0.6 },      
    { value: 5, color: '#ADFF2F', opacity: 0.6 },
    { value: 10, color: '#FFFF00', opacity: 0.65 },     
    { value: 15, color: '#F7C948', opacity: 0.7 },
    { value: 20, color: '#FFA500', opacity: 0.8 },     
    { value: 25, color: '#FF8C00', opacity: 0.85 },
    { value: 30, color: '#FF4500', opacity: 0.9 },     
    { value: 35, color: '#FF0000', opacity: 0.95 },     
    { value: 40, color: '#8B0000', opacity: 1.0 }      
  ],
  humidity: [
    { value: 0, color: '#FFFFFF', opacity: 0 },
    { value: 20, color: '#FEE4E2', opacity: 0.3 },
    { value: 40, color: '#FED7AA', opacity: 0.4 },
    { value: 60, color: '#FDE68A', opacity: 0.5 },
    { value: 75, color: '#FCA5A5', opacity: 0.6 },
    { value: 90, color: '#F87171', opacity: 0.75 },
    { value: 100, color: '#EF4444', opacity: 0.9 }
  ],
  cloud_cover: [
    { value: 0, color: '#FFFFFF', opacity: 0 },
    { value: 20, color: '#E6F7FF', opacity: 0.25 },
    { value: 40, color: '#CFEFFF', opacity: 0.35 },
    { value: 60, color: '#A9D6FF', opacity: 0.5 },
    { value: 80, color: '#7FB3FF', opacity: 0.7 },
    { value: 100, color: '#FF6B6B', opacity: 0.9 } // heavy/very cloudy -> reddish
  ],
  uv_index: [
    { value: 0, color: '#FFFFFF', opacity: 0 },
    { value: 1, color: '#E6FFFA', opacity: 0.25 },
    { value: 3, color: '#C6F6D5', opacity: 0.35 },
    { value: 5, color: '#FEEBC8', opacity: 0.45 },
    { value: 7, color: '#FBD38D', opacity: 0.6 },
    { value: 9, color: '#F56565', opacity: 0.8 },
    { value: 11, color: '#C53030', opacity: 1.0 }
  ],
  wind_speed: [
    { value: 0, color: '#F0F8FF', opacity: 0.3 },      // Calm - alice blue
    { value: 3, color: '#E0FFFF', opacity: 0.4 },      // Light air - light cyan
    { value: 7, color: '#AFEEEE', opacity: 0.5 },      // Light breeze - pale turquoise
    { value: 12, color: '#40E0D0', opacity: 0.6 },     // Gentle breeze - turquoise
    { value: 18, color: '#00CED1', opacity: 0.7 },     // Moderate breeze - dark turquoise
    { value: 25, color: '#1E90FF', opacity: 0.7 },     // Fresh breeze - dodger blue
    { value: 32, color: '#0000FF', opacity: 0.8 },     // Strong breeze - blue
    { value: 39, color: '#8A2BE2', opacity: 0.8 },     // Near gale - blue violet
    { value: 47, color: '#9932CC', opacity: 0.9 },     // Gale - dark orchid
    { value: 55, color: '#800080', opacity: 1.0 }      // Strong gale - purple
  ]
}

// Generate weather grid for NASA-style visualization
const generateWeatherGrid = (centerLat: number, centerLng: number, radius: number = 1.5) => {
  const gridSize = 0.05 // Smaller grid cells (about 5.5km) for better resolution
  const gridPoints = []
  
  // Create a regular grid around the center point
  for (let lat = centerLat - radius; lat <= centerLat + radius; lat += gridSize) {
    for (let lng = centerLng - radius; lng <= centerLng + radius; lng += gridSize) {
      // Calculate distance from center
      const distance = Math.sqrt(
        Math.pow((lat - centerLat) * 111, 2) + 
        Math.pow((lng - centerLng) * Math.cos(lat * Math.PI / 180) * 111, 2)
      )
      
      // Only include points within the radius
      if (distance <= radius * 111) { // Convert radius to km
        gridPoints.push({
          id: `grid-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          bounds: [
            [lat, lng],
            [lat + gridSize, lng + gridSize]
          ] as [[number, number], [number, number]]
        })
      }
    }
  }
  
  console.log(`Generated ${gridPoints.length} grid cells for NASA IMERG style display`)
  return gridPoints
}

// Get color for value using NASA-style scale
const getNASAColor = (value: number, variable: string) => {
  const validVariable = variable as keyof typeof NASA_COLOR_SCALES
  const scale = NASA_COLOR_SCALES[validVariable] || NASA_COLOR_SCALES.precipitation
  
  // Find appropriate color based on value
  for (let i = scale.length - 1; i >= 0; i--) {
    if (value >= scale[i].value) {
      return {
        color: scale[i].color,
        opacity: scale[i].opacity
      }
    }
  }
  
  return { color: scale[0].color, opacity: scale[0].opacity }
}

// New metadata-driven variable definitions (replaces WEATHER_VARIABLES)
type VariableKey = 'precipitation' | 'temperature' | 'wind_speed' | 'humidity' | 'cloud_cover' | 'uv_index'

interface VariableMeta {
  label: string
  unit: string
  icon: LucideIcon
  description: string
  dataset: string
}

const VARIABLE_DETAILS: Record<VariableKey, VariableMeta> = {
  precipitation: {
    label: 'Precipitation',
    unit: 'mm/h',
    icon: CloudRain,
    description: 'Real-time precipitation rate from Open-Meteo/NASA IMERG',
    dataset: 'GPM IMERG'
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    icon: Thermometer,
    description: '2-meter air temperature from Open-Meteo/NASA POWER',
    dataset: 'MERRA-2'
  },
  wind_speed: {
    label: 'Wind Speed',
    unit: 'm/s',
    icon: Wind,
    description: '10-meter wind speed from Open-Meteo',
    dataset: 'MERRA-2'
  },
  humidity: {
    label: 'Relative Humidity',
    unit: '%',
    icon: Droplets,
    description: 'Relative humidity at 2 meters',
    dataset: 'MERRA-2'
  },
  cloud_cover: {
    label: 'Cloud Cover',
    unit: '%',
    icon: Cloud,
    description: 'Total cloud cover percentage',
    dataset: 'MODIS'
  },
  uv_index: {
    label: 'UV Index',
    unit: 'UVI',
    icon: Sun,
    description: 'Ultraviolet radiation index',
    dataset: 'OMI'
  }
}

const VARIABLE_OPTIONS: VariableKey[] = ['temperature', 'precipitation', 'wind_speed', 'humidity', 'cloud_cover', 'uv_index']

// Time periods for forecast data
const TIME_PERIODS = [
  { id: 'current', name: 'Current', hours: 0 },
  { id: '3h', name: '3 Hours', hours: 3 },
  { id: '6h', name: '6 Hours', hours: 6 },
  { id: '12h', name: '12 Hours', hours: 12 },
  { id: '24h', name: '1 Day', hours: 24 },
  { id: '48h', name: '2 Days', hours: 48 },
  { id: '72h', name: '3 Days', hours: 72 }
]

// Map tile layer options
const TILE_LAYERS = [
  {
    id: 'openstreetmap',
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, NASA'
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap'
  }
]

interface WeatherMapProps {
  className?: string
  initialLocation?: { lat: number; lng: number }
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void
  showControls?: boolean
  height?: string
}

export default function WeatherMap({ 
  className = '',
  initialLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  onLocationSelect,
  showControls = true,
  height = '500px'
}: WeatherMapProps) {
  const [selectedVariable, setSelectedVariable] = useState<VariableKey>('temperature')
  const [timePeriod, setTimePeriod] = useState('current')
  const [threshold, setThreshold] = useState([0]) // Lower threshold to show more data
  const [isAnimating, setIsAnimating] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [tileLayer, setTileLayer] = useState('openstreetmap')
  const [weatherData, setWeatherData] = useState<any[]>([])
  const [weatherGrid, setWeatherGrid] = useState<any[]>([])
  const [wttrGrid, setWttrGrid] = useState<any[]>([])
  // Display mode: 'zones' = discrete rectangles, 'continuous' = smooth gradient canvas
  const [displayMode, setDisplayMode] = useState<'zones' | 'wttr'>('zones')
  const [isLoading, setIsLoading] = useState(false)
  const [lastApiInfo, setLastApiInfo] = useState<{status?:number, dataPoints?:number, source?:string, durationMs?:number}|null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const [tileCount, setTileCount] = useState<number>(0)
  const [tileSampleSrc, setTileSampleSrc] = useState<string | null>(null)
  const [reactLeafletAvailable, setReactLeafletAvailable] = useState<boolean>(true)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [legendCollapsed, setLegendCollapsed] = useState(false)
  
  // wttr.in third-party weather validation
  const [wttrSnapshot, setWttrSnapshot] = useState<{
    current?: { temperatureC?: number; humidity?: number; windSpeed?: number; precipitation?: number }
    error?: string
  } | null>(null)
  
  // Enhanced animation controls
  const [animationSpeed, setAnimationSpeed] = useState(1000) // ms between frames
  const [selectedDay, setSelectedDay] = useState(0) // 0-6 for 7 days
  const [selectedHour, setSelectedHour] = useState(12) // 0-23 hours
  const [forecastMode, setForecastMode] = useState<'current' | '7day'>('current')
  const [animationFrame, setAnimationFrame] = useState(0) // index into per-cell forecast arrays
  const [weatherThresholds, setWeatherThresholds] = useState({
    temperature: { min: -10, max: 40 },
    precipitation: { min: 0, max: 100 },
    wind: { min: 0, max: 50 },
    humidity: { min: 0, max: 100 }
  })
  
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const currentTimeIndex = useRef(0)
  
  const currentVariable = VARIABLE_DETAILS[selectedVariable]
  const currentTileLayer = TILE_LAYERS.find(t => t.id === tileLayer)

  // Generate 7-day forecast data
  const generate7DayForecast = useCallback(() => {
    const forecast = []
    const baseDate = new Date()
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour += 3) { // Every 3 hours
        const date = new Date(baseDate)
        date.setDate(date.getDate() + day)
        date.setHours(hour, 0, 0, 0)
        
        // Generate realistic weather data based on location and season
        const dayFactor = Math.sin(hour * Math.PI / 12) // Temperature variation during day
        const seasonFactor = Math.sin((date.getMonth() - 2) * Math.PI / 6) // Seasonal variation
        const randomFactor = (Math.random() - 0.5) * 0.3
        
        forecast.push({
          id: `forecast_${day}_${hour}`,
          lat: selectedLocation.lat + (Math.random() - 0.5) * 0.1,
          lng: selectedLocation.lng + (Math.random() - 0.5) * 0.1,
          timestamp: date.toISOString(),
          day,
          hour,
          temperature: 15 + seasonFactor * 20 + dayFactor * 10 + randomFactor * 5,
          precipitation: Math.max(0, (Math.random() - 0.7) * 100), // 30% chance of rain
          wind: 5 + Math.random() * 15 + Math.abs(seasonFactor) * 10,
          humidity: 40 + Math.random() * 40 + Math.abs(seasonFactor) * 20,
          uv: Math.max(0, dayFactor * 10 + seasonFactor * 3),
          pressure: 1013 + (Math.random() - 0.5) * 50
        })
      }
    }
    
    return forecast
  }, [selectedLocation])

  // Generate mock weather data points and grid
  const generateWeatherData = useCallback(async () => {
    if (forecastMode === '7day') return generate7DayForecast()

    // Fetch real current weather for center location to use as base
    let baseTemp = 5 // Default for Pavlodar in October
    try {
      const weatherRes = await fetch(`/api/weather?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`)
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json()
        baseTemp = weatherData.current?.temperature ?? 5
      }
    } catch (e) {
      console.warn('Failed to fetch base weather, using default')
    }

    // try server
    try {
      const response = await fetch('/api/forecast/nasa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: selectedLocation.lat, lng: selectedLocation.lng, radius: 50, gridSize: 3 })
      })

      if (response.ok) {
        const nasaData = await response.json()
        const weatherPoints = nasaData.weatherData || []

        const grid = generateWeatherGrid(selectedLocation.lat, selectedLocation.lng, 1.0)
        const gridWithData = grid.map(gridCell => {
          // find nearest server point
          let attachedForecast: any[] | null = null
          let valuesFromServer: any = null
          if (weatherPoints.length) {
            let best: { p?: any; d?: number } | null = null
            for (const p of weatherPoints) {
              const d = Math.hypot(p.lat - gridCell.lat, p.lng - gridCell.lng)
              if (!best || d < best.d!) best = { p, d }
            }
            if (best && best.p) {
              attachedForecast = best.p.forecast || null
              valuesFromServer = best.p.values || null
            }
          }

          // fallback base data
          const distanceFromCenter = Math.sqrt(
            Math.pow((gridCell.lat - selectedLocation.lat) * 111, 2) + Math.pow((gridCell.lng - selectedLocation.lng) * 111, 2)
          )
          const baseIntensity = Math.max(0, 1 - distanceFromCenter / 50)
          const noise = (Math.sin(gridCell.lat * 100) + Math.cos(gridCell.lng * 100)) * 0.3
          const baseData = {
            precipitation: Math.max(0, (baseIntensity + noise + Math.random() * 0.4) * 25),
            temperature: baseTemp + Math.sin(gridCell.lat * 0.1) * 3 + Math.random() * 2,
            wind_speed: Math.max(0, baseIntensity * 15 + Math.random() * 10),
            humidity: 50 + baseIntensity * 30 + Math.random() * 20,
            cloud_cover: Math.min(100, baseIntensity * 80 + Math.random() * 40),
            uv_index: Math.max(0, (1 - baseIntensity) * 8 + Math.random() * 3)
          }

          return {
            ...gridCell,
            data: valuesFromServer || baseData,
            forecast: attachedForecast // may be null
          }
        })

        setWeatherGrid(gridWithData)
        return weatherPoints
      }
    } catch (e) {
      console.warn('Failed to fetch NASA data, using mock data:', e)
    }

    // fallback mock
    const data: any[] = []
    const baselat = selectedLocation.lat
    const baseLng = selectedLocation.lng
    const grid = generateWeatherGrid(baselat, baseLng, 1.0)
    const gridWithData = grid.map(gridCell => {
      const distanceFromCenter = Math.sqrt(
        Math.pow((gridCell.lat - baselat) * 111, 2) + Math.pow((gridCell.lng - baseLng) * 111, 2)
      )
      const baseIntensity = Math.max(0, 1 - distanceFromCenter / 50)
      const noise = (Math.sin(gridCell.lat * 100) + Math.cos(gridCell.lng * 100)) * 0.3
      const baseData = {
        precipitation: Math.max(0, (baseIntensity + noise + Math.random() * 0.4) * 25),
        temperature: baseTemp + Math.sin(gridCell.lat * 0.1) * 3 + Math.random() * 2,
        wind_speed: Math.max(0, baseIntensity * 15 + Math.random() * 10),
        humidity: 50 + baseIntensity * 30 + Math.random() * 20,
        cloud_cover: Math.min(100, baseIntensity * 80 + Math.random() * 40),
        uv_index: Math.max(0, (1 - baseIntensity) * 8 + Math.random() * 3)
      }
      return { ...gridCell, data: baseData, forecast: TIME_PERIODS.map(period => ({ time: new Date(Date.now() + period.hours * 60 * 60 * 1000), values: baseData })) }
    })
    setWeatherGrid(gridWithData)

    for (let i = 0; i < 50; i++) {
      const latOffset = (Math.random() - 0.5) * 2
      const lngOffset = (Math.random() - 0.5) * 2
      const values = {
        precipitation: Math.random() * 100,
        temperature: 10 + Math.random() * 25,
        wind_speed: Math.random() * 15,
        humidity: 30 + Math.random() * 50,
        cloud_cover: Math.random() * 100,
        uv_index: Math.random() * 12
      }
      data.push({ id: i, lat: baselat + latOffset, lng: baseLng + lngOffset, values, forecast: TIME_PERIODS.map(period => ({ time: new Date(Date.now() + period.hours * 60 * 60 * 1000), values })) })
    }

    return data
  }, [selectedLocation, forecastMode, generate7DayForecast])

  // Sync animationFrame with selectedDay/Hour or timePeriod
  useEffect(() => {
    if (forecastMode === '7day') {
      const idx = selectedDay * 8 + Math.floor(selectedHour / 3)
      setAnimationFrame(idx)
    } else {
      const idx = TIME_PERIODS.findIndex(p => p.id === timePeriod)
      setAnimationFrame(idx >= 0 ? idx : 0)
    }
  }, [selectedDay, selectedHour, timePeriod, forecastMode])
  
  // Fetch wttr.in validation data
  const fetchWttrData = useCallback(async () => {
    try {
      // Use our API proxy to avoid CORS issues
      const response = await fetch(`/api/weather/wttr?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`)
      if (!response.ok) throw new Error('wttr.in fetch failed')
      
      const wttrData = await response.json()
      
      // Check if response contains error
      if (wttrData.error) {
        throw new Error(wttrData.error)
      }
      
      const current = wttrData.current_condition?.[0]
      
      if (current) {
        setWttrSnapshot({
          current: {
            temperatureC: parseFloat(current.temp_C),
            humidity: parseFloat(current.humidity),
            windSpeed: parseFloat(current.windspeedKmph) / 3.6, // convert to m/s
            precipitation: parseFloat(current.precipMM) || 0 // precipitation in mm
          }
        })
      }
    } catch (error) {
      console.warn('wttr.in fetch failed:', error)
      setWttrSnapshot({ error: String(error) })
    }
  }, [selectedLocation])

  // Generate Wttr.in Grid with multiple API calls for surrounding area
  const generateWttrGrid = useCallback(async () => {
    try {
      console.log('🌐 [Wttr.in] Generating grid for location:', selectedLocation)
      
      // Create a smaller grid (5x5 = 25 cells) to avoid rate limits
      const gridSize = 5
      const radius = 0.5 // degrees (~50km)
      const grid: any[] = []
      
      // Generate grid cells
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const latOffset = ((i - gridSize / 2) / gridSize) * radius * 2
          const lngOffset = ((j - gridSize / 2) / gridSize) * radius * 2
          const cellLat = selectedLocation.lat + latOffset
          const cellLng = selectedLocation.lng + lngOffset
          
          grid.push({
            lat: cellLat,
            lng: cellLng,
            bounds: [
              [cellLat - radius / gridSize, cellLng - radius / gridSize],
              [cellLat + radius / gridSize, cellLng + radius / gridSize]
            ]
          })
        }
      }
      
      // Fetch data for each cell with delay to avoid rate limiting
      const gridWithData = []
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i]
        
        try {
          // Add delay between requests (wttr.in rate limit)
          if (i > 0) await new Promise(resolve => setTimeout(resolve, 100))
          
          // Use our API proxy to avoid CORS issues
          const response = await fetch(`/api/weather/wttr?lat=${cell.lat.toFixed(2)}&lng=${cell.lng.toFixed(2)}`)
          
          if (response.ok) {
            const data = await response.json()
            
            // Check if response contains error
            if (!data.error) {
              const current = data.current_condition?.[0]
              
              if (current) {
                gridWithData.push({
                  ...cell,
                  data: {
                    temperature: parseFloat(current.temp_C) || 0,
                    humidity: parseFloat(current.humidity) || 0,
                    wind_speed: parseFloat(current.windspeedKmph) / 3.6 || 0,
                    precipitation: parseFloat(current.precipMM) || 0,
                    cloud_cover: parseFloat(current.cloudcover) || 0,
                    uv_index: parseFloat(current.uvIndex) || 0
                  }
                })
                continue
              }
            }
          }
          // If we reach here, wttr.in returned an error or invalid data
          // Continue to fallback data below
        } catch (err) {
          console.warn('🌐 [Wttr.in] Failed to fetch cell:', cell)
        }
        
        // If we haven't added this cell yet (no successful fetch above), add with fallback data
        if (!gridWithData.find(item => item.lat === cell.lat && item.lng === cell.lng)) {
          gridWithData.push({
            ...cell,
            data: {
              temperature: 0,
              humidity: 50,
              wind_speed: 0,
              precipitation: 0,
              cloud_cover: 50,
              uv_index: 0
            }
          })
        }
      }
      
      console.log('🌐 [Wttr.in] Generated grid with', gridWithData.length, 'cells')
      return gridWithData
    } catch (error) {
      console.error('🌐 [Wttr.in] Grid generation failed:', error)
      return []
    }
  }, [selectedLocation])

  // Load weather data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const t0 = Date.now()
        const data = await generateWeatherData()
        const dur = Date.now() - t0
        setWeatherData(data)
        
        // Fetch wttr.in validation data in parallel
        fetchWttrData()
        
        // Load Wttr.in Grid if in wttr mode
        if (displayMode === 'wttr') {
          const wttrGridData = await generateWttrGrid()
          setWttrGrid(wttrGridData)
        }
        
        // if server returned metadata, capture it (generateWeatherData sets weatherGrid and returns points)
        // We'll attempt to fetch server metadata by calling the API directly for diagnostics
        try {
          const infoRes = await fetch('/api/forecast/nasa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: selectedLocation.lat, lng: selectedLocation.lng, radius: 50, gridSize: 1 }) })
          if (infoRes.ok) {
            const info = await infoRes.json()
            setLastApiInfo({ status: infoRes.status, dataPoints: info.dataPoints ?? info.weatherData?.length, source: info.source, durationMs: dur })
          } else {
            setLastApiInfo({ status: infoRes.status, durationMs: dur })
          }
        } catch (e) {
          // ignore secondary info fetch errors
          setLastApiInfo({ durationMs: dur })
        }
        
        // Ensure weatherGrid is always generated for NASA zones mode
        if (weatherGrid.length === 0) {
          console.log('🔄 Force generating weather grid for NASA zones')
          const grid = generateWeatherGrid(selectedLocation.lat, selectedLocation.lng, 1.0);
          const gridWithData = grid.map((gridCell, index) => {
            const distanceFromCenter = Math.sqrt(
              Math.pow((gridCell.lat - selectedLocation.lat) * 111, 2) + 
              Math.pow((gridCell.lng - selectedLocation.lng) * 111, 2)
            );
            
            const baseIntensity = Math.max(0, 1 - (distanceFromCenter / 50));
            const noise = (Math.sin(gridCell.lat * 100) + Math.cos(gridCell.lng * 100)) * 0.3;
            
            // Use actual current temperature as base (will be fetched by generateWeatherData)
            const currentTemp = 5; // Fallback for Pavlodar
            return {
              ...gridCell,
              data: {
                precipitation: Math.max(0, (baseIntensity + noise + Math.random() * 0.4) * 25),
                temperature: currentTemp + Math.sin(gridCell.lat * 0.1) * 3 + Math.random() * 2,
                wind_speed: Math.max(0, baseIntensity * 15 + Math.random() * 10),
                humidity: 50 + baseIntensity * 30 + Math.random() * 20,
                cloud_cover: Math.min(100, baseIntensity * 80 + Math.random() * 40),
                uv_index: Math.max(0, (1 - baseIntensity) * 8 + Math.random() * 3)
              }
            }
          });
          
          console.log(`✅ Force generated ${gridWithData.length} NASA IMERG grid cells`);
          setWeatherGrid(gridWithData);
        }
      } catch (error: any) {
        console.error('Failed to load weather data:', error)
        setClientError(String(error?.message || error))
        setWeatherData([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [selectedLocation, generateWeatherData, fetchWttrData, generateWttrGrid, weatherGrid.length, displayMode])

  // Debug: if after loading the grid almost all values for the selected variable are zero/null, switch to temperature for visibility
  useEffect(() => {
    if (!weatherGrid || weatherGrid.length === 0) return
    try {
      const vals = weatherGrid.map(g => g.data?.[selectedVariable])
      const numDefined = vals.filter(v => v !== undefined && v !== null).length
      const numZeroOrNull = vals.filter(v => v === 0 || v === null || v === undefined).length
      // If >80% are zero/null or undefined, auto-switch to temperature to reveal overlay during debugging
      if (numDefined > 0 && (numZeroOrNull / vals.length) > 0.8) {
        console.warn('[WeatherMap] Detected mostly-empty overlay for', selectedVariable, '- switching to temperature for debugging')
        setSelectedVariable('temperature')
      }
    } catch (e) {
      // ignore
    }
  }, [weatherGrid, selectedVariable])

  // Debug: log a small sample of weatherGrid for developer inspection
  useEffect(() => {
    try {
      if (!weatherGrid) return
      console.log('[WeatherMap] weatherGrid updated - length:', weatherGrid.length)
      const sample = weatherGrid.slice(0, 5).map(g => ({ id: g.id, lat: g.lat, lng: g.lng, data: g.data }))
      console.log('[WeatherMap] sample grid cells:', sample)
    } catch (e) { /* ignore */ }
  }, [weatherGrid])

  useEffect(() => {
    // log tile URL for debugging separately (avoids JSX logging)
    const url = currentTileLayer?.url || TILE_LAYERS[0].url
    console.log('[WeatherMap] TileLayer URL:', url)
  }, [currentTileLayer])

  // Verify that react-leaflet dynamic import will succeed at runtime
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await import('react-leaflet')
        if (!cancelled) setReactLeafletAvailable(true)
      } catch (e: any) {
        console.warn('react-leaflet import failed:', e)
        if (!cancelled) {
          setReactLeafletAvailable(false)
          setClientError(`react-leaflet missing or failed to load: ${String(e?.message || e)}`)
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Poll DOM for leaflet tile elements to detect whether tiles are loading
  useEffect(() => {
    if (!mapLoaded || !reactLeafletAvailable) return

    let cancelled = false
    const updateTiles = () => {
      try {
        const tiles = document.querySelectorAll('.leaflet-tile')
        if (cancelled) return
        setTileCount(tiles.length)
        const first = tiles[0] as HTMLImageElement | undefined
        setTileSampleSrc(first?.src ?? null)
      } catch (e) {
        // ignore
      }
    }

    updateTiles()
    const iv = setInterval(updateTiles, 1000)

    // Global capture of image tile load errors for diagnostics (capture in capture phase)
    const tileErrorHandler = (ev: Event) => {
      const target = ev.target as HTMLImageElement | null
      try {
        if (!target) return
        if (target.classList && target.classList.contains('leaflet-tile')) {
          console.warn('[WeatherMap] Tile load error for', target.src)
          setTileSampleSrc(target.src)
        }
      } catch (e) { /* ignore */ }
    }

    // Capture tile load successes too (first loaded tile)
    const tileLoadHandler = (ev: Event) => {
      const target = ev.target as HTMLImageElement | null
      try {
        if (!target) return
        if (target.classList && target.classList.contains('leaflet-tile')) {
          setTileSampleSrc(prev => prev || target.src)
        }
      } catch (e) { /* ignore */ }
    }

    document.addEventListener('error', tileErrorHandler, true)
    document.addEventListener('load', tileLoadHandler, true)

    return () => { cancelled = true; clearInterval(iv); document.removeEventListener('error', tileErrorHandler, true); document.removeEventListener('load', tileLoadHandler, true) }
  }, [mapLoaded, currentTileLayer, reactLeafletAvailable])

  // Ensure weather grid is initialized
  useEffect(() => {
    if (weatherGrid.length === 0 && !isLoading) {
      console.log('🔄 Initializing weather grid for NASA zones')
      const grid = generateWeatherGrid(selectedLocation.lat, selectedLocation.lng, 1.0);
      const gridWithData = grid.map((gridCell, index) => {
        const distanceFromCenter = Math.sqrt(
          Math.pow((gridCell.lat - selectedLocation.lat) * 111, 2) + 
          Math.pow((gridCell.lng - selectedLocation.lng) * 111, 2)
        );
        
        const baseIntensity = Math.max(0, 1 - (distanceFromCenter / 50));
        const noise = (Math.sin(gridCell.lat * 100) + Math.cos(gridCell.lng * 100)) * 0.3;
        
        return {
          ...gridCell,
          data: {
            precipitation: Math.max(0, (baseIntensity + noise + Math.random() * 0.4) * 25),
            temperature: 18 + Math.sin(gridCell.lat * 0.1) * 8 + Math.random() * 4,
            wind_speed: Math.max(0, baseIntensity * 15 + Math.random() * 10),
            humidity: 50 + baseIntensity * 30 + Math.random() * 20,
            cloud_cover: Math.min(100, baseIntensity * 80 + Math.random() * 40),
            uv_index: Math.max(0, (1 - baseIntensity) * 8 + Math.random() * 3)
          }
        }
      });
      
      console.log(`✅ Initialized ${gridWithData.length} NASA IMERG grid cells`);
      setWeatherGrid(gridWithData);
    }
  }, [selectedLocation, weatherGrid.length, isLoading])

  // Animation control
  const startAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }
    
    setIsAnimating(true)
    // Проверяем: если анимация дошла до конца, перезапускаем с начала
    if (forecastMode === '7day') {
      const totalFrames = 7 * 8
      const currentIndex = selectedDay * 8 + Math.floor(selectedHour / 3)
      
      // Если на последнем кадре - перезапускаем с начала
      if (currentIndex >= totalFrames - 1) {
        console.log('🔄 [Animation] Restarting 7day animation from beginning')
        currentTimeIndex.current = 0
        setSelectedDay(0)
        setSelectedHour(0)
      } else {
        currentTimeIndex.current = currentIndex
      }
    } else {
      const idx = TIME_PERIODS.findIndex(p => p.id === timePeriod)
      const currentIndex = idx >= 0 ? idx : 0
      
      // Если на последнем периоде - перезапускаем с начала
      if (currentIndex >= TIME_PERIODS.length - 1) {
        console.log('🔄 [Animation] Restarting current mode animation from beginning')
        currentTimeIndex.current = 0
        setTimePeriod(TIME_PERIODS[0].id)
      } else {
        currentTimeIndex.current = currentIndex
      }
    }
    
    const animateStep = () => {
      if (forecastMode === '7day') {
        const totalFrames = 7 * 8 // 7 days * 8 periods
        // advance forward until last frame, then stop
        if (currentTimeIndex.current < totalFrames - 1) {
          currentTimeIndex.current += 1
          const day = Math.floor(currentTimeIndex.current / 8)
          const hour = (currentTimeIndex.current % 8) * 3
          setSelectedDay(day)
          setSelectedHour(hour)
        } else {
          // reached end - останавливаем но НЕ сбрасываем индекс
          console.log('🎬 [Animation] Reached end of 7day animation')
          setIsAnimating(false)
          if (animationRef.current) { clearInterval(animationRef.current); animationRef.current = null }
        }
      } else {
        // current mode: animate through TIME_PERIODS forward-only
        if (currentTimeIndex.current < TIME_PERIODS.length - 1) {
          currentTimeIndex.current += 1
          setTimePeriod(TIME_PERIODS[currentTimeIndex.current].id)
        } else {
          // reached end - останавливаем но НЕ сбрасываем индекс
          console.log('🎬 [Animation] Reached end of current mode animation')
          setIsAnimating(false)
          if (animationRef.current) { clearInterval(animationRef.current); animationRef.current = null }
        }
      }
    }
    
    animationRef.current = setInterval(animateStep, animationSpeed)
  }

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
  }

  // Get current values for time period
  const getCurrentValues = (dataPoint: any) => {
    if (timePeriod === 'current') {
      return dataPoint.values
    }
    
    const forecast = dataPoint.forecast.find((f: any) => {
      const period = TIME_PERIODS.find(p => p.id === timePeriod)
      if (!period) return false
      
      // Ensure f.time is a Date object
      const forecastTime = typeof f.time === 'string' ? new Date(f.time) : f.time
      if (!forecastTime || isNaN(forecastTime.getTime())) return false
      
      return Math.abs(forecastTime.getTime() - (Date.now() + period.hours * 60 * 60 * 1000)) < 30 * 60 * 1000
    })
    
    return forecast ? forecast.values : dataPoint.values
  }

  // Filter weather data based on selected time
  const getFilteredWeatherData = () => {
    if (forecastMode === '7day') {
      return weatherData.filter(point => {
        if (point.day !== undefined && point.hour !== undefined) {
          return point.day === selectedDay && point.hour === selectedHour
        }
        return false
      })
    }
    return weatherData
  }

  // Export map data
  const exportMapData = () => {
    const filteredData = getFilteredWeatherData()
    const exportData = {
      variable: selectedVariable,
      timePeriod: forecastMode === '7day' ? `Day ${selectedDay}, Hour ${selectedHour}` : timePeriod,
      threshold: threshold[0],
      location: selectedLocation,
      forecastMode,
      selectedDay,
      selectedHour,
      data: filteredData.map(point => ({
        lat: point.lat,
        lng: point.lng,
        value: getCurrentValues(point)[selectedVariable],
        timestamp: point.timestamp || new Date().toISOString()
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weather-map-${selectedVariable}-${timePeriod}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Map click handler
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    setSelectedLocation({ lat, lng })
    
    if (onLocationSelect) {
      onLocationSelect({ lat, lng })
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Load Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      
      // Fix default markers — dynamic import to avoid hard crash if package missing
      ;(async () => {
        try {
          const L = await import('leaflet')
          try {
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
            })
          } catch (e) {
            console.warn('Leaflet icon merge failed', e)
          }
          setMapLoaded(true)
        } catch (e: any) {
          console.warn('Leaflet dynamic import failed:', e)
          setClientError(`Leaflet load failed: ${String(e?.message || e)}`)
          // still mark as loaded so the rest of the UI renders and we can show a helpful error
          setMapLoaded(true)
        }
      })()
    }
  }, [])


  return (
    <div className={`flex flex-col ${className}`}>
      {/* Controls Panel */}
      {showControls && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Weather Map Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Weather Variable</p>
                <Select value={selectedVariable} onValueChange={(value) => setSelectedVariable(value as VariableKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {VARIABLE_OPTIONS.map(key => {
                      const meta = VARIABLE_DETAILS[key]
                      const Icon = meta.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-500" />
                            {meta.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Time Period</p>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PERIODS.map(period => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Forecast Mode</p>
                <Select value={forecastMode} onValueChange={(value) => setForecastMode(value as 'current' | '7day')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Snapshot</SelectItem>
                    <SelectItem value="7day">7-Day Playback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Base Map</p>
                <Select value={tileLayer} onValueChange={setTileLayer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TILE_LAYERS.map(layer => (
                      <SelectItem key={layer.id} value={layer.id}>
                        {layer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {forecastMode === '7day' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Day</p>
                  <Slider
                    value={[selectedDay]}
                    onValueChange={(value) => setSelectedDay(value[0])}
                    min={0}
                    max={6}
                    step={1}
                  />
                  <p className="text-xs text-gray-500">
                    {['Today', 'Tomorrow', '+2 days', '+3 days', '+4 days', '+5 days', '+6 days'][selectedDay]}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Hour</p>
                  <Slider
                    value={[selectedHour]}
                    onValueChange={(value) => setSelectedHour(value[0])}
                    min={0}
                    max={23}
                    step={1}
                  />
                  <p className="text-xs text-gray-500">{selectedHour}:00</p>
                </div>
              </div>
            )}

            {currentVariable && (
              <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <currentVariable.icon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{currentVariable.label}</span>
                  <Badge variant="outline">{currentVariable.dataset}</Badge>
                </div>
                <p className="text-sm text-blue-800">{currentVariable.description}</p>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-blue-900">NASA scale ({currentVariable.unit})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {NASA_COLOR_SCALES[selectedVariable]?.map((scale, index) => (
                      <div key={`${scale.value}-${index}`} className="flex items-center gap-2 text-xs text-blue-800">
                        <span
                          className="inline-block h-3 w-4 rounded border border-blue-200"
                          style={{ backgroundColor: scale.color, opacity: scale.opacity }}
                        />
                        <span>
                          {index === 0 ? `< ${scale.value}` :
                            index === NASA_COLOR_SCALES[selectedVariable].length - 1 ? `≥ ${scale.value}` : `${scale.value}+`} {currentVariable.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Animation speed</p>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  min={200}
                  max={2000}
                  step={100}
                />
                <p className="text-xs text-gray-500">Frame interval: {animationSpeed} ms</p>
              </div>
              {displayMode === 'zones' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Zone threshold</p>
                  <Slider
                    value={threshold}
                    onValueChange={setThreshold}
                    min={NASA_COLOR_SCALES[selectedVariable]?.[0]?.value ?? 0}
                    max={NASA_COLOR_SCALES[selectedVariable]?.[NASA_COLOR_SCALES[selectedVariable].length - 1]?.value ?? 100}
                    step={1}
                  />
                  <p className="text-xs text-gray-500">Hide tiles below {threshold[0]} {currentVariable?.unit}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isAnimating ? stopAnimation : startAnimation}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isAnimating ? 'Stop animation' : 'Animate'}
                </Button>
                <div className="flex items-center gap-2 rounded border px-3 py-2">
                  <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
                  <span className="text-sm">Show overlay</span>
                </div>
                <div className="flex items-center gap-2 rounded border border-blue-500 bg-blue-50 px-3 py-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <Select value={displayMode} onValueChange={(value) => setDisplayMode(value as 'zones' | 'wttr')}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zones">NASA grid tiles</SelectItem>
                      <SelectItem value="wttr">Wttr.in grid tiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={exportMapData} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Badge variant="outline" className="py-2">
                  <MapPin className="mr-1 h-3 w-3" />
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => setLegendCollapsed(prev => !prev)}>
                  {legendCollapsed ? 'Show legend' : 'Hide legend'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {forecastMode === '7day'
                    ? `7-day playback • ${['Today', 'Tomorrow', '+2 days', '+3 days', '+4 days', '+5 days', '+6 days'][selectedDay]} @ ${selectedHour}:00`
                    : 'Current blended conditions'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-blue-800">
                <span>Open-Meteo points: {lastApiInfo?.dataPoints ?? weatherGrid.length}</span>
                <span>Zones: {weatherGrid.length}</span>
                <span>Display: {displayMode}</span>
                <span>Variable: {currentVariable?.label}</span>
                {wttrSnapshot?.current && (
                  <span>
                    wttr.in: {wttrSnapshot.current.temperatureC ?? '–'}°C • 
                    {wttrSnapshot.current.precipitation !== undefined ? `${wttrSnapshot.current.precipitation.toFixed(1)}mm rain` : '0mm'} • 
                    {wttrSnapshot.current.windSpeed?.toFixed(1) ?? '–'} m/s wind • 
                    {wttrSnapshot.current.humidity ?? '–'}% RH
                  </span>
                )}
                <span>Animation: {isAnimating ? `running (${Math.round((2000 - animationSpeed) / 20)}% speed)` : 'stopped'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div className="relative" style={{ height }}>
        {mapLoaded && reactLeafletAvailable ? (
          <MapContainer
            center={[selectedLocation.lat, selectedLocation.lng]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
          >
            <MapEventHandler onMapClick={handleMapClick} />
            
            <TileLayer
              url={currentTileLayer?.url || TILE_LAYERS[0].url}
              attribution={currentTileLayer?.attribution || TILE_LAYERS[0].attribution}
            />

            {/* Selected Location Marker */}
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">Selected Location</h3>
                  <p className="text-sm">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Wttr.in Grid Overlay */}
            {showOverlay && currentVariable && displayMode === 'wttr' && wttrGrid.map((gridCell, idx) => {
              const value = gridCell.data?.[selectedVariable]
              if (value === undefined || value === null) return null

              const nasaColor = getNASAColor(Number(value), selectedVariable)
              const variableLabel = VARIABLE_DETAILS[selectedVariable]?.label || selectedVariable

              return (
                <Rectangle
                  key={`wttr-cell-${idx}`}
                  bounds={gridCell.bounds}
                  pathOptions={{
                    color: nasaColor.color,
                    weight: 1,
                    fillColor: nasaColor.color,
                    fillOpacity: nasaColor.opacity * 0.7
                  }}
                  eventHandlers={{
                    click: () => {
                      console.log('Wttr.in Cell clicked:', gridCell)
                    }
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold mb-2">Wttr.in Data</p>
                      <p className="text-xs text-gray-500 mb-1">
                        {gridCell.lat.toFixed(3)}, {gridCell.lng.toFixed(3)}
                      </p>
                      <p><strong>{variableLabel}:</strong> {Number(value).toFixed(2)} {VARIABLE_DETAILS[selectedVariable]?.unit || ''}</p>
                      {gridCell.data.temperature !== undefined && (
                        <p>Temperature: {gridCell.data.temperature.toFixed(1)}°C</p>
                      )}
                      {gridCell.data.humidity !== undefined && (
                        <p>Humidity: {gridCell.data.humidity.toFixed(0)}%</p>
                      )}
                      {gridCell.data.wind_speed !== undefined && (
                        <p>Wind: {gridCell.data.wind_speed.toFixed(1)} m/s</p>
                      )}
                      <p className="text-xs text-blue-600 mt-2">Source: Wttr.in API</p>
                    </div>
                  </Popup>
                </Rectangle>
              )
            })}

            {showOverlay && currentVariable && displayMode === 'zones' && weatherGrid.map(gridCell => {
            // prefer per-cell forecast frame value when available
            let value = gridCell.data?.[selectedVariable]
            let frameTime: string | null = null
            if (gridCell.forecast && Array.isArray(gridCell.forecast) && gridCell.forecast.length > 0) {
              const frame = gridCell.forecast[Math.min(animationFrame, gridCell.forecast.length - 1)]
              if (frame && frame.values && frame.values[selectedVariable] !== undefined) {
                value = frame.values[selectedVariable]
                frameTime = typeof frame.time === 'string' ? frame.time : (frame.time instanceof Date ? frame.time.toISOString() : String(frame.time))
              }
            }

            if (value === undefined || value === null || value < threshold[0]) return null

            const nasaColor = getNASAColor(Number(value), selectedVariable)

            // Slightly expand bounds to create a small overlap between cells and avoid visible grid lines
            const [[lat1, lng1], [lat2, lng2]] = gridCell.bounds
            const overlap = 0.0005 // ~50m overlap
            const bounds = [
              [lat1 - overlap, lng1 - overlap],
              [lat2 + overlap, lng2 + overlap]
            ] as [[number, number], [number, number]]

            return (
              <Rectangle
                pane="overlayPane"
                key={gridCell.id}
                bounds={bounds}
                pathOptions={{
                  color: nasaColor.color,
                  fillColor: nasaColor.color,
                  fillOpacity: Math.max(0.15, nasaColor.opacity),
                  weight: 0,
                  opacity: 1
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold flex items-center gap-1">
                      <currentVariable.icon className="h-4 w-4" />
                      {currentVariable.label}
                    </h4>
                    <p className="text-lg font-bold" style={{ color: nasaColor.color }}>
                      {Number(value).toFixed(1)} {currentVariable.unit}
                    </p>
                    {frameTime && <p className="text-xs text-gray-600">Time: {new Date(frameTime).toLocaleString()}</p>}
                    <p className="text-sm text-gray-600">
                      Grid: {gridCell.lat.toFixed(3)}, {gridCell.lng.toFixed(3)}
                    </p>
                    <div className="mt-2 text-xs">
                      <p><strong>Style:</strong> NASA IMERG Zones</p>
                      <p><strong>Source:</strong> {currentVariable.dataset}</p>
                    </div>
                  </div>
                </Popup>
              </Rectangle>
            )
          })}

            {/* Points mode removed — NASA IMERG style rendering (zones or continuous canvas) */}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-50">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Map not initialized. {clientError ? `Error: ${clientError}` : 'Initializing map...'}</p>
            </div>
          </div>
        )}

        {/* Debug info panel */}
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-[1200] text-xs">
            <div className="font-medium">Debug</div>
            <div className="text-xxs text-gray-600">API: {lastApiInfo ? `${lastApiInfo.source || 'unknown'} (${lastApiInfo.dataPoints ?? 0} pts) ${lastApiInfo.durationMs ?? 0}ms` : 'no call yet'}</div>
            <div className="text-xxs text-gray-600">Tiles: {tileCount} {tileSampleSrc ? `sample: ${tileSampleSrc}` : ''}</div>
            <div className="text-xxs text-gray-600">Frame: {animationFrame}</div>
            {clientError && <div className="text-red-600">Error: {clientError}</div>}
        </div>
        {/* NASA Color Legend */}
        {showOverlay && currentVariable && !legendCollapsed && (
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <currentVariable.icon className="h-3 w-3" />
              {currentVariable.label} Scale
            </h4>
            <div className="space-y-1">
              {NASA_COLOR_SCALES[selectedVariable as keyof typeof NASA_COLOR_SCALES]?.map((scale, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-4 h-3 border border-gray-300" 
                    style={{ 
                      backgroundColor: scale.color, 
                      opacity: scale.opacity 
                    }}
                  />
                  <span className="text-gray-700">
                    {index === 0 ? `< ${scale.value}` : 
                     index === NASA_COLOR_SCALES[selectedVariable as keyof typeof NASA_COLOR_SCALES].length - 1 ? 
                     `> ${scale.value}` : 
                     `${scale.value}+`} {currentVariable.unit}
                  </span>
                </div>
              )) || (
                <div className="text-xs text-gray-500">No color scale available</div>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
              NASA IMERG Style
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading weather data...</p>
            </div>
          </div>
        )}
        {/* Animation progress overlay */}
        {isAnimating && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow z-[1100] text-xs">
            <div className="font-medium">Animation</div>
            <div className="w-40 h-2 bg-gray-200 rounded mt-1 overflow-hidden">
              <div className="h-2 bg-blue-500" style={{ width: `${Math.min(100, (animationFrame / (7*8-1)) * 100)}%` }} />
            </div>
            <div className="mt-1 text-gray-600">Frame: {animationFrame}</div>
          </div>
        )}
        {/* Animation progress overlay */}
        {isAnimating && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded z-[1200] text-sm">
            <div>Animating — Frame {animationFrame}</div>
            {forecastMode === '7day' ? (
              <div className="text-xs">Day {selectedDay} @ {selectedHour}:00</div>
            ) : (
              <div className="text-xs">Period: {timePeriod}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// CanvasOverlay: draws a smooth gradient from discrete grid cells onto a Leaflet overlay canvas
function CanvasOverlay({ weatherGrid, variable, animationFrame }: { weatherGrid: any[], variable: string, animationFrame: number }) {
  const map = useMap() as any
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [redrawTrigger, setRedrawTrigger] = useState(0)

  // Create canvas element and append to overlay pane once
  useEffect(() => {
    if (!map || !map.getPanes) return
    // create or reuse a dedicated pane to avoid interfering with Leaflet internals
    const paneName = 'resq-overlay-pane'
    try {
      if (!map.getPane(paneName)) map.createPane(paneName)
    } catch (e) {
      // some react-leaflet wrappers may not expose createPane; fall back to overlayPane
    }
    const overlayPane = map.getPane(paneName) || map.getPanes().overlayPane
    if (!overlayPane) return

    // If already created, reuse
    let canvas = canvasRef.current
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvasRef.current = canvas
    }

    // Style and append if not already appended
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    // ensure this pane is above tiles but below UI overlays
    try { (overlayPane as HTMLElement).style.zIndex = '650' } catch(e) {}
    canvas.style.pointerEvents = 'none'
    if (canvas.parentNode !== overlayPane) {
      try {
        overlayPane.appendChild(canvas)
      } catch (e) {
        console.warn('CanvasOverlay append failed:', e)
      }
    }

    const onMapChange = () => {
      // trigger resize and redraw — keep canvas size in CSS as well to avoid pixel-scaling issues
      const size = map.getSize()
      if (size && canvas) {
        // set actual backing store size
        canvas.width = size.x
        canvas.height = size.y
        // make sure CSS size matches (helps on high-DPI devices)
        canvas.style.width = `${size.x}px`
        canvas.style.height = `${size.y}px`
      }
      // Force redraw on map movement/zoom
      setRedrawTrigger(prev => prev + 1)
    }

    map.on && map.on('move', onMapChange)
    map.on && map.on('moveend', onMapChange)
    map.on && map.on('zoomend', onMapChange)
    map.on && map.on('resize', onMapChange)
    
    // Initial sizing
    onMapChange()

    return () => {
      try {
        map.off && map.off('move', onMapChange)
        map.off && map.off('moveend', onMapChange)
        map.off && map.off('zoomend', onMapChange)
        map.off && map.off('resize', onMapChange)
      } catch (e) {
        // ignore
      }

      // Remove canvas only if it's still a child of overlayPane
      try {
        if (canvas && canvas.parentNode === overlayPane) overlayPane.removeChild(canvas)
      } catch (e) {
        console.warn('CanvasOverlay cleanup removeChild safe-guard:', e)
      }
    }
  }, [map])

  // Draw when weatherGrid, variable or animationFrame changes OR map state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!map || !canvas || !map.latLngToContainerPoint) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure canvas size matches map
    const size = map.getSize()
    if (size) {
      canvas.width = size.x
      canvas.height = size.y
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log('🟢 [Canvas] Cleared canvas, size:', canvas.width, 'x', canvas.height)

    // КРИТИЧНО: Получаем pixelOrigin для правильного offset при pan/zoom
    const bounds = map.getBounds()
    if (!bounds) {
      console.warn('⚠️ [Canvas] No bounds available')
      return
    }
    
    // Используем layerPoint вместо containerPoint для корректной работы с zoom/pan
    const pixelOrigin = map.getPixelOrigin()
    console.log('🟢 [Canvas] PixelOrigin:', pixelOrigin.x, pixelOrigin.y, '| Zoom:', map.getZoom())
    
    // Применяем transform для компенсации сдвига карты
    ctx.save()
    ctx.translate(-pixelOrigin.x, -pixelOrigin.y)
    
    let drawnCells = 0
    for (const cell of weatherGrid || []) {
      try {
        const cellBounds = cell.bounds
        if (!cellBounds || !Array.isArray(cellBounds)) continue
        const [[lat1, lng1], [lat2, lng2]] = cellBounds
        
        // Используем latLngToLayerPoint (координаты в системе слоя карты)
        const p1 = map.latLngToLayerPoint([lat1, lng1])
        const p2 = map.latLngToLayerPoint([lat2, lng2])
        
        if (!p1 || !p2 || Number.isNaN(p1.x) || Number.isNaN(p2.x)) continue

        const x = Math.min(p1.x, p2.x)
        const y = Math.min(p1.y, p2.y)
        const w = Math.abs(p2.x - p1.x)
        const h = Math.abs(p2.y - p1.y)
        
        // После ctx.translate координаты уже относительно canvas viewport
        // Проверяем пересечение с видимой областью (оптимизация)
        // НЕ используем pixelOrigin здесь - он уже применён через transform!
        if (x + w < pixelOrigin.x || x > pixelOrigin.x + canvas.width || 
            y + h < pixelOrigin.y || y > pixelOrigin.y + canvas.height) continue

        let v = cell.data?.[variable]
        if (cell.forecast && Array.isArray(cell.forecast) && cell.forecast.length > 0) {
          const frame = cell.forecast[Math.min(animationFrame, cell.forecast.length - 1)]
          if (frame && frame.values && frame.values[variable] !== undefined) v = frame.values[variable]
        }
        if (v === undefined || v === null) continue

        const c = getNASAColor(Number(v), variable)
        ctx.fillStyle = c.color
        ctx.globalAlpha = Math.max(0.12, c.opacity * 0.9)
        // draw with slight overlap to avoid seams
        ctx.fillRect(Math.floor(x) - 1, Math.floor(y) - 1, Math.max(1, Math.ceil(w) + 2), Math.max(1, Math.ceil(h) + 2))
        drawnCells++
      } catch (err) {
        // Continue on per-cell errors
        console.warn('⚠️ [Canvas] Draw cell error:', err)
        continue
      }
    }

    ctx.restore() // Восстанавливаем transform
    ctx.globalAlpha = 1.0
    console.log('🟢 [Canvas] Drew', drawnCells, 'cells out of', weatherGrid?.length || 0)
  }, [map, weatherGrid, variable, animationFrame, redrawTrigger])

  return null
}
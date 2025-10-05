import { NextRequest, NextResponse } from 'next/server'

interface USGSEarthquakeFeature {
  type: string
  properties: {
    mag: number
    place: string
    time: number
    updated: number
    tz: number | null
    url: string
    detail: string
    felt: number | null
    cdi: number | null
    mmi: number | null
    alert: string | null
    status: string
    tsunami: number
    sig: number
    net: string
    code: string
    ids: string
    sources: string
    types: string
    nst: number | null
    dmin: number | null
    rms: number
    gap: number | null
    magType: string
    type: string
    title: string
  }
  geometry: {
    type: string
    coordinates: [number, number, number] // [longitude, latitude, depth]
  }
  id: string
}

interface USGSResponse {
  type: string
  metadata: {
    generated: number
    url: string
    title: string
    status: number
    api: string
    count: number
  }
  features: USGSEarthquakeFeature[]
}

interface EmergencyAlert {
  id: string
  type: 'EARTHQUAKE' | 'TSUNAMI' | 'WILDFIRE' | 'FLOOD' | 'HURRICANE' | 'VOLCANO'
  severity: 'EXTREME' | 'SEVERE' | 'MODERATE' | 'MINOR'
  headline: string
  description: string
  location: {
    lat: number
    lng: number
    name: string
  }
  magnitude?: number
  depth?: number
  time: string
  distance?: number // Distance from user in km
  url?: string
  tsunami: boolean
  image: string
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getSeverity(magnitude: number): 'EXTREME' | 'SEVERE' | 'MODERATE' | 'MINOR' {
  if (magnitude >= 7.0) return 'EXTREME'
  if (magnitude >= 6.0) return 'SEVERE'
  if (magnitude >= 4.5) return 'MODERATE'
  return 'MINOR'
}

function getAlertImage(type: string): string {
  const imageMap: Record<string, string> = {
    'EARTHQUAKE': '/alerts/earthquake.svg',
    'TSUNAMI': '/alerts/tsunami.svg',
    'WILDFIRE': '/alerts/fire.svg',
    'FLOOD': '/alerts/flood.svg',
    'HURRICANE': '/alerts/hurricane.svg',
    'VOLCANO': '/alerts/volcano.svg'
  }
  return imageMap[type] || '/globe.svg'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = parseFloat(searchParams.get('lat') || '52.2873') // Default to Pavlodar
    const lng = parseFloat(searchParams.get('lng') || '76.9674')
    const radius = parseFloat(searchParams.get('radius') || '500') // km
    const minMagnitude = parseFloat(searchParams.get('minMagnitude') || '4.0')
    const days = parseInt(searchParams.get('days') || '7')

    // Fetch real earthquake data from USGS
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - days)
    
    const usgsUrl = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query')
    usgsUrl.searchParams.append('format', 'geojson')
    usgsUrl.searchParams.append('starttime', startTime.toISOString().split('T')[0])
    usgsUrl.searchParams.append('minmagnitude', minMagnitude.toString())
    usgsUrl.searchParams.append('orderby', 'time')
    usgsUrl.searchParams.append('limit', '100')

    const usgsResponse = await fetch(usgsUrl.toString(), {
      headers: {
        'User-Agent': 'ResQ Emergency App'
      }
    })

    if (!usgsResponse.ok) {
      throw new Error(`USGS API error: ${usgsResponse.status}`)
    }

    const usgsData: USGSResponse = await usgsResponse.json()

    // Transform USGS data to our format and filter by distance
    const alerts: EmergencyAlert[] = usgsData.features
      .map((feature) => {
        const [longitude, latitude, depth] = feature.geometry.coordinates
        const distance = calculateDistance(lat, lng, latitude, longitude)
        
        return {
          id: feature.id,
          type: 'EARTHQUAKE' as const,
          severity: getSeverity(feature.properties.mag),
          headline: feature.properties.title,
          description: `Magnitude ${feature.properties.mag} earthquake occurred ${feature.properties.place}. Depth: ${depth.toFixed(1)} km.`,
          location: {
            lat: latitude,
            lng: longitude,
            name: feature.properties.place
          },
          magnitude: feature.properties.mag,
          depth: depth,
          time: new Date(feature.properties.time).toISOString(),
          distance: distance,
          url: feature.properties.url,
          tsunami: feature.properties.tsunami === 1,
          image: getAlertImage('EARTHQUAKE')
        }
      })
      .filter(alert => alert.distance && alert.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 50) // Limit to 50 most relevant alerts

    // Add tsunami alerts if any earthquake triggered it
    const tsunamiAlerts: EmergencyAlert[] = alerts
      .filter(alert => alert.tsunami)
      .map(alert => ({
        ...alert,
        id: `tsunami-${alert.id}`,
        type: 'TSUNAMI' as const,
        headline: `Tsunami Warning after ${alert.headline}`,
        description: `Tsunami warning issued following magnitude ${alert.magnitude} earthquake. Stay away from coastal areas.`,
        image: getAlertImage('TSUNAMI')
      }))

    const allAlerts = [...alerts, ...tsunamiAlerts]

    return NextResponse.json({
      success: true,
      count: allAlerts.length,
      alerts: allAlerts,
      metadata: {
        userLocation: { lat, lng },
        radius: radius,
        minMagnitude: minMagnitude,
        days: days,
        source: 'USGS Earthquake Hazards Program',
        generated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching emergency data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch emergency data',
        details: error instanceof Error ? error.message : 'Unknown error',
        alerts: []
      },
      { status: 500 }
    )
  }
}

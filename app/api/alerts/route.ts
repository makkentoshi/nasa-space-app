import { NextRequest, NextResponse } from 'next/server'
import { AlertManager } from '@/lib/alerts'

// API FOR GETTING ALERTS
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '50000') // 50km default
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')

    // Map frontend type names to database enum values
    const typeMapping: Record<string, string> = {
      'tsunami': 'TSUNAMI',
      'earthquake': 'EARTHQUAKE',
      'fire': 'WILDFIRE',
      'wildfire': 'WILDFIRE',
      'hurricane': 'HURRICANE',
      'flood': 'FLOOD',
      'tornado': 'TORNADO',
      'volcano': 'VOLCANO',
      'chemical': 'CHEMICAL',
      'other': 'OTHER'
    }

    const mappedType = type ? typeMapping[type.toLowerCase()] || type.toUpperCase() : null

    // Get live alerts from external sources
    let liveAlerts: any[] = []
    try {
      const alertManager = new AlertManager()
      liveAlerts = await alertManager.fetchAllAlerts()
    } catch (error) {
      console.error('Error fetching live alerts:', error)
      liveAlerts = []
    }

    // Merge alerts
    const allAlerts = [
      ...liveAlerts.map(alert => {
        const distance = lat && lng ? calculateDistance(lat, lng, alert.geometry) : null
        return {
          ...alert,
          id: alert.id,
          distance,
          safetyScore: distance !== null ? calculateSafetyScore(distance, alert.severity) : null
        }
      })
    ]

    // Filter by radius if location provided
    let filteredAlerts = allAlerts
    if (lat && lng && radius) {
      filteredAlerts = allAlerts.filter(alert => 
        !alert.distance || alert.distance <= radius
      )
    }

    // Filter by type if specified
    if (mappedType) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.type === mappedType
      )
    }

    // Filter by severity if specified
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.severity.toLowerCase() === severity.toLowerCase()
      )
    }

    // Sort by distance (closest first) then by severity
    filteredAlerts.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance
      }
      const severityOrder = { 'EXTREME': 4, 'SEVERE': 3, 'MODERATE': 2, 'MINOR': 1 }
      return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
             (severityOrder[a.severity as keyof typeof severityOrder] || 0)
    })

    return NextResponse.json(filteredAlerts.slice(0, 50)) // Limit to 50 results
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

function calculateDistance(lat1: number, lng1: number, geometry: any): number | null {
  if (!geometry || !geometry.coordinates) return null

  if (geometry.type === 'Point') {
    const [lng2, lat2] = geometry.coordinates
    return haversineDistance(lat1, lng1, lat2, lng2)
  }

  if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
    // For polygons, calculate distance to closest point
    let minDistance = Infinity
    const coords = geometry.type === 'Polygon' ? geometry.coordinates[0] : geometry.coordinates[0][0]
    
    for (const [lng2, lat2] of coords) {
      const distance = haversineDistance(lat1, lng1, lat2, lng2)
      minDistance = Math.min(minDistance, distance)
    }
    
    return minDistance
  }

  return null
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function calculateSafetyScore(distance: number | null, severity: string): number | null {
  if (distance === null) return null

  const severityMultiplier = {
    'EXTREME': 2.0,
    'SEVERE': 1.5,
    'MODERATE': 1.0,
    'MINOR': 0.5
  }

  const multiplier = severityMultiplier[severity as keyof typeof severityMultiplier] || 1.0
  const baseScore = Math.max(0, 100 - (distance / 1000) * multiplier)
  
  return Math.round(baseScore * 10) / 10
}

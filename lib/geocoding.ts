// Geocoding utilities for location services

export interface LocationResult {
  lat: number
  lng: number
  name: string
  country: string
  region?: string
}

// Reverse geocoding - get city name from coordinates
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Using our proxy API to avoid CORS issues
    const response = await fetch(
      `/api/geocode?lat=${lat}&lng=${lng}`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    // Extract city/town/village name
    const address = data.address || {}
    const cityName = 
      address.city || 
      address.town || 
      address.village || 
      address.municipality || 
      address.county || 
      address.state || 
      'Unknown Location'
    
    const country = address.country || ''
    
    return country ? `${cityName}, ${country}` : cityName
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

// Forward geocoding - search cities by name
export async function searchLocations(query: string): Promise<LocationResult[]> {
  try {
    if (query.length < 2) return []
    
    // Using our proxy API to avoid CORS issues
    const response = await fetch(
      `/api/geocode?q=${encodeURIComponent(query)}`
    )
    
    if (!response.ok) {
      throw new Error('Location search failed')
    }
    
    const data = await response.json()
    
    return data.map((item: any) => {
      const address = item.address || {}
      const name = 
        address.city || 
        address.town || 
        address.village || 
        address.municipality || 
        item.display_name.split(',')[0]
      
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: name,
        country: address.country || '',
        region: address.state || address.region || ''
      }
    }).filter((location: LocationResult) => 
      // Filter out very specific addresses, prefer cities/towns
      location.name && !location.name.match(/^\d+/)
    )
  } catch (error) {
    console.error('Location search failed:', error)
    return []
  }
}

// Get current location with city name
export async function getCurrentLocationWithName(): Promise<{
  lat: number
  lng: number
  name: string
  accuracy?: number
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        try {
          const name = await reverseGeocode(latitude, longitude)
          resolve({
            lat: latitude,
            lng: longitude,
            name,
            accuracy
          })
        } catch (error) {
          resolve({
            lat: latitude,
            lng: longitude,
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            accuracy
          })
        }
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  })
}
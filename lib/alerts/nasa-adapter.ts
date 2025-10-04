import { AlertSource, NormalizedAlert, AlertType, AlertSeverity } from './types'

export class NasaEonetAdapter implements AlertSource {
  id = 'nasa-eonet'
  name = 'NASA EONET'

  async fetchAlerts(): Promise<NormalizedAlert[]> {
    const apiKey = process.env.NASA_EONET_API_KEY || 'DEMO_KEY'
    const url = `https://eonet.gsfc.nasa.gov/api/v3/events?api_key=${apiKey}&status=open&limit=20`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('NASA API response not ok')
      const data = await res.json()

      const alerts: NormalizedAlert[] = []

      if (data.events && Array.isArray(data.events)) {
        for (const event of data.events) {
          const alert = this.normalizeEvent(event)
          if (alert) alerts.push(alert)
        }
      }

      return alerts
    } catch (error) {
      console.error('Failed to fetch NASA EONET alerts:', error)
      return []
    }
  }

  private normalizeEvent(event: any): NormalizedAlert | null {
    try {
      const categories = event.categories || []
      const geometries = event.geometries || []

      if (!geometries.length) return null

      const latestGeometry = geometries[geometries.length - 1]
      const coords = latestGeometry.coordinates

      let type: AlertType = AlertType.OTHER
      let severity: AlertSeverity = AlertSeverity.MINOR

      // Map NASA categories to our types
      for (const cat of categories) {
        const title = cat.title?.toLowerCase() || ''
        if (title.includes('earthquake')) {
          type = AlertType.EARTHQUAKE
          severity = AlertSeverity.MODERATE
        } else if (title.includes('volcano')) {
          type = AlertType.VOLCANO
          severity = AlertSeverity.SEVERE
        } else if (title.includes('wildfire') || title.includes('fire')) {
          type = AlertType.WILDFIRE
          severity = AlertSeverity.SEVERE
        } else if (title.includes('storm') || title.includes('hurricane') || title.includes('cyclone')) {
          type = AlertType.HURRICANE
          severity = AlertSeverity.SEVERE
        } else if (title.includes('flood')) {
          type = AlertType.FLOOD
          severity = AlertSeverity.MODERATE
        }
      }

      // Create normalized geometry
      let geometry: GeoJSON.Geometry
      if (latestGeometry.type === 'Point') {
        geometry = {
          type: 'Point',
          coordinates: coords
        }
      } else if (latestGeometry.type === 'Polygon') {
        geometry = {
          type: 'Polygon',
          coordinates: coords
        }
      } else {
        // Default to point
        geometry = {
          type: 'Point',
          coordinates: Array.isArray(coords[0]) ? coords[0] : coords
        }
      }

      return {
        id: `nasa-${event.id}`,
        externalId: event.id,
        source: 'NASA EONET',
        type,
        severity,
        headline: event.title || 'Natural Event',
        description: event.description || undefined,
        geometry,
        startsAt: event.date ? new Date(event.date) : undefined,
        payload: {
          categories: categories.map((c: any) => c.title),
          sources: event.sources?.map((s: any) => s.url) || []
        }
      }
    } catch (error) {
      console.error('Failed to normalize NASA EONET event:', error)
      return null
    }
  }
}

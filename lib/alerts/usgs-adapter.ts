import { AlertSource, NormalizedAlert, AlertType, AlertSeverity } from './types'

export class UsgsAdapter implements AlertSource {
  id = 'usgs'
  name = 'USGS Earthquakes'

  async fetchAlerts(): Promise<NormalizedAlert[]> {
    // Fetch earthquakes from the last 24 hours
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('USGS API response not ok')
      const data = await res.json()

      const alerts: NormalizedAlert[] = []

      if (data.features && Array.isArray(data.features)) {
        for (const feature of data.features) {
          const alert = this.normalizeEarthquake(feature)
          if (alert) alerts.push(alert)
        }
      }

      return alerts
    } catch (error) {
      console.error('Failed to fetch USGS earthquakes:', error)
      return []
    }
  }

  private normalizeEarthquake(feature: any): NormalizedAlert | null {
    try {
      const props = feature.properties || {}
      const geom = feature.geometry || {}

      if (!geom.coordinates || geom.coordinates.length < 2) return null

      const [longitude, latitude, depth] = geom.coordinates
      const magnitude = props.mag || 0
      const place = props.place || 'Unknown location'
      const time = props.time ? new Date(props.time) : new Date()

      // Determine severity based on magnitude
      let severity = AlertSeverity.MINOR
      if (magnitude >= 5.0) severity = AlertSeverity.SEVERE
      else if (magnitude >= 4.0) severity = AlertSeverity.MODERATE

      return {
        id: `usgs-${feature.id}`,
        externalId: feature.id,
        source: 'USGS',
        type: AlertType.EARTHQUAKE,
        severity,
        headline: `M${magnitude.toFixed(1)} Earthquake`,
        description: `${place}. Magnitude: ${magnitude}, Depth: ${depth}km.`,
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        startsAt: time,
        regionCode: undefined,
        payload: {
          magnitude,
          depth,
          place,
          tsunami: props.tsunami || 0,
          felt: props.felt || 0,
          cdi: props.cdi,
          mmi: props.mmi
        }
      }
    } catch (error) {
      console.error('Failed to normalize USGS earthquake:', error)
      return null
    }
  }
}

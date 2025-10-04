import { AlertSource, NormalizedAlert, AlertType, AlertSeverity } from './types'

export class FirmsAdapter implements AlertSource {
  id = 'firms'
  name = 'NASA FIRMS'

  async fetchAlerts(): Promise<NormalizedAlert[]> {
    const apiKey = process.env.FIRMS_API_KEY
    if (!apiKey) {
      console.warn('FIRMS_API_KEY not set, skipping FIRMS alerts')
      return []
    }

    // Fetch active fires from VIIRS (last 24 hours, global)
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${apiKey}/VIIRS_SNPP_NRT/global/1/`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('FIRMS API response not ok')
      const csvText = await res.text()

      const alerts: NormalizedAlert[] = []
      const lines = csvText.split('\n').slice(1) // Skip header

      for (const line of lines) {
        if (!line.trim()) continue
        const alert = this.parseCsvLine(line)
        if (alert) alerts.push(alert)
      }

      return alerts
    } catch (error) {
      console.error('Failed to fetch FIRMS alerts:', error)
      return []
    }
  }

  private parseCsvLine(line: string): NormalizedAlert | null {
    const parts = line.split(',')
    if (parts.length < 10) return null

    try {
      const latitude = parseFloat(parts[0])
      const longitude = parseFloat(parts[1])
      const brightness = parseFloat(parts[2])
      const confidence = parts[8]
      const acqDate = parts[5]
      const acqTime = parts[6]

      // Determine severity based on confidence and brightness
      let severity = AlertSeverity.MINOR
      if (confidence === 'h' || brightness > 400) severity = AlertSeverity.SEVERE
      else if (confidence === 'n' || brightness > 350) severity = AlertSeverity.MODERATE

      return {
        id: `firms-${latitude}-${longitude}-${acqDate}`,
        source: 'NASA FIRMS',
        type: AlertType.WILDFIRE,
        severity,
        headline: `Active Fire Detection`,
        description: `Fire detected with brightness ${brightness}K and ${confidence} confidence.`,
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        startsAt: new Date(`${acqDate}T${acqTime}`),
        payload: {
          brightness,
          confidence,
          scan: parts[3],
          track: parts[4]
        }
      }
    } catch (error) {
      return null
    }
  }
}

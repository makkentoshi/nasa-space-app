import { AlertSource, NormalizedAlert, AlertType, AlertSeverity } from './types'

export class GdacsAdapter implements AlertSource {
  id = 'gdacs'
  name = 'GDACS Disasters'

  async fetchAlerts(): Promise<NormalizedAlert[]> {
    // Fetch recent disaster events from GDACS
    const url = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?from=2023-01-01&to=2025-12-31&alertlevel=Green;Orange;Red'

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('GDACS API response not ok')
      const data = await res.text()

      // GDACS returns XML, so we need to parse it
      const alerts: NormalizedAlert[] = []
      const events = this.parseGdacsXml(data)

      for (const event of events) {
        const alert = this.normalizeGdacsEvent(event)
        if (alert) alerts.push(alert)
      }

      return alerts
    } catch (error) {
      console.error('Failed to fetch GDACS alerts:', error)
      return []
    }
  }

  private parseGdacsXml(xmlText: string): any[] {
    // Simple XML parsing - in production use a proper XML parser
    const events: any[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1]
      const event: any = {}

      const titleMatch = itemContent.match(/<title>(.*?)<\/title>/)
      if (titleMatch) event.title = titleMatch[1]

      const descMatch = itemContent.match(/<description>(.*?)<\/description>/)
      if (descMatch) event.description = descMatch[1]

      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/)
      if (linkMatch) event.link = linkMatch[1]

      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)
      if (pubDateMatch) event.pubDate = pubDateMatch[1]

      events.push(event)
    }

    return events
  }

  private normalizeGdacsEvent(event: any): NormalizedAlert | null {
    try {
      const title = event.title || ''
      const description = event.description || ''
      const link = event.link || ''
      const pubDate = event.pubDate ? new Date(event.pubDate) : new Date()

      // Extract coordinates from description or use default
      let latitude = 0
      let longitude = 0
      const coordMatch = description.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
      if (coordMatch) {
        latitude = parseFloat(coordMatch[1])
        longitude = parseFloat(coordMatch[2])
      }

      // Determine alert type from title/description
      let type = AlertType.OTHER
      let severity = AlertSeverity.MINOR

      const lowerTitle = title.toLowerCase()
      const lowerDesc = description.toLowerCase()

      if (lowerTitle.includes('earthquake') || lowerDesc.includes('earthquake')) {
        type = AlertType.EARTHQUAKE
        severity = AlertSeverity.MODERATE
      } else if (lowerTitle.includes('tsunami')) {
        type = AlertType.TSUNAMI
        severity = AlertSeverity.SEVERE
      } else if (lowerTitle.includes('cyclone') || lowerTitle.includes('hurricane') || lowerTitle.includes('typhoon')) {
        type = AlertType.HURRICANE
        severity = AlertSeverity.SEVERE
      } else if (lowerTitle.includes('flood')) {
        type = AlertType.FLOOD
        severity = AlertSeverity.MODERATE
      } else if (lowerTitle.includes('volcano')) {
        type = AlertType.VOLCANO
        severity = AlertSeverity.SEVERE
      }

      // Determine severity from alert level in description
      if (description.includes('Red') || description.includes('red')) {
        severity = AlertSeverity.EXTREME
      } else if (description.includes('Orange') || description.includes('orange')) {
        severity = AlertSeverity.SEVERE
      }

      return {
        id: `gdacs-${link.split('/').pop() || Date.now()}`,
        source: 'GDACS',
        type,
        severity,
        headline: title,
        description,
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        startsAt: pubDate,
        payload: {
          link
        }
      }
    } catch (error) {
      console.error('Failed to normalize GDACS event:', error)
      return null
    }
  }
}

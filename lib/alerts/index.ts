import { putAlert, getAlerts } from '@/lib/idb'

// Simple adapter: fetch recent earthquakes from USGS and store normalized alerts
export async function fetchUSGSEarthquakes() {
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Network response not ok')
    const data = await res.json()

    // Normalize and persist
    if (Array.isArray(data.features)) {
      for (const f of data.features) {
        const id = f.id
        const props = f.properties || {}
        const geom = f.geometry || {}
        const alert = {
          id,
          source: 'USGS',
          type: 'earthquake',
          severity: props.mag || 0,
          message: props.title || 'Earthquake',
          timestamp: props.time || Date.now(),
          location: {
            lat: geom.coordinates ? geom.coordinates[1] : null,
            lng: geom.coordinates ? geom.coordinates[0] : null,
          },
          raw: f
        }
        try {
          await putAlert(alert)
        } catch (err) {
          console.error('Failed to persist alert', err)
        }
      }
    }

    return true
  } catch (err) {
    console.error('Failed to fetch USGS feed', err)
    return false
  }
}

export async function getStoredAlerts() {
  return getAlerts()
}
import { AlertSource } from './types'
import { MockAlertAdapter } from './mock-adapter'
import { NasaEonetAdapter } from './nasa-adapter'
import { FirmsAdapter } from './firms-adapter'
import { UsgsAdapter } from './usgs-adapter'
import { GdacsAdapter } from './gdacs-adapter'

export class AlertManager {
  private sources: AlertSource[] = []

  constructor() {
    this.initializeSources()
  }

  private initializeSources() {
    const adapter = process.env.ALERTS_ADAPTER || 'mock'
    
    switch (adapter) {
      case 'mock':
      default:
        this.sources.push(new MockAlertAdapter())
        break
      case 'nasa-live':
        this.sources.push(new NasaEonetAdapter())
        break
      case 'firms':
        this.sources.push(new FirmsAdapter())
        break
      case 'usgs':
        this.sources.push(new UsgsAdapter())
        break
      case 'gdacs':
        this.sources.push(new GdacsAdapter())
        break
      case 'all':
        this.sources.push(new MockAlertAdapter())
        this.sources.push(new NasaEonetAdapter())
        this.sources.push(new FirmsAdapter())
        this.sources.push(new UsgsAdapter())
        this.sources.push(new GdacsAdapter())
        break
      // Add other adapters here when implemented
    }
  }

  async fetchAllAlerts() {
    const allAlerts = []
    
    for (const source of this.sources) {
      try {
        const alerts = await source.fetchAlerts()
        allAlerts.push(...alerts)
      } catch (error) {
        console.error(`Failed to fetch alerts from ${source.name}:`, error)
      }
    }

    const deduplicatedAlerts = this.deduplicateAlerts(allAlerts)
    
    // Send push notifications for new alerts
    await this.sendPushNotifications(deduplicatedAlerts)
    
    return deduplicatedAlerts
  }

  private async sendPushNotifications(alerts: any[]) {
    // TODO: Implement push notification logic
    // This would integrate with the service worker and push API
    console.log(`Would send push notifications for ${alerts.length} alerts`)
  }

  private deduplicateAlerts(alerts: any[]) {
    const seen = new Set<string>()
    const unique = []

    for (const alert of alerts) {
      // Create a unique key based on location, type, and time
      const key = `${alert.type}-${JSON.stringify(alert.geometry.coordinates)}-${Math.floor(alert.startsAt?.getTime() || Date.now() / 3600000)}`
      
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(alert)
      }
    }

    return unique
  }
}

export * from './types'

import { AlertSource, NormalizedAlert, AlertType, AlertSeverity } from './types'

export class MockAlertAdapter implements AlertSource {
  id = 'mock'
  name = 'Mock Alerts'

  async fetchAlerts(): Promise<NormalizedAlert[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return [
      {
        id: 'mock-earthquake-1',
        externalId: 'mock-usgs-001',
        source: 'Mock USGS',
        type: AlertType.EARTHQUAKE,
        severity: AlertSeverity.MODERATE,
        headline: 'M4.5 Earthquake - 10km NE of San Francisco, CA',
        description: 'A magnitude 4.5 earthquake occurred 10km northeast of San Francisco. Moderate shaking expected in the area.',
        geometry: {
          type: 'Point',
          coordinates: [-122.3482, 37.8044]
        },
        startsAt: new Date(),
        regionCode: 'US-CA',
        payload: {
          magnitude: 4.5,
          depth: 12.3,
          place: '10km NE of San Francisco, CA'
        }
      },
      {
        id: 'mock-wildfire-1',
        externalId: 'mock-calfire-002',
        source: 'Mock CAL FIRE',
        type: AlertType.WILDFIRE,
        severity: AlertSeverity.SEVERE,
        headline: 'Wildfire Alert - Sonoma County',
        description: 'Active wildfire burning in Sonoma County. Evacuation warnings issued for nearby communities.',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-122.8, 38.3],
            [-122.6, 38.3],
            [-122.6, 38.5],
            [-122.8, 38.5],
            [-122.8, 38.3]
          ]]
        },
        startsAt: new Date(Date.now() - 3600000), // 1 hour ago
        regionCode: 'US-CA',
        payload: {
          containment: '25%',
          acresBurned: 2500,
          personnel: 150
        }
      },
      {
        id: 'mock-flood-1',
        externalId: 'mock-noaa-003',
        source: 'Mock NOAA',
        type: AlertType.FLOOD,
        severity: AlertSeverity.SEVERE,
        headline: 'Flood Warning - Russian River Basin',
        description: 'Heavy rainfall has caused the Russian River to reach flood stage. Residents in low-lying areas should prepare for evacuation.',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-123.0, 38.4],
            [-122.9, 38.5],
            [-122.8, 38.6],
            [-122.7, 38.7]
          ]
        },
        startsAt: new Date(Date.now() + 1800000), // 30 minutes from now
        endsAt: new Date(Date.now() + 86400000), // 24 hours from now
        regionCode: 'US-CA',
        payload: {
          floodStage: '32 ft',
          currentLevel: '31.2 ft',
          expectedCrest: '34 ft'
        }
      }
    ]
  }
}

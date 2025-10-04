import { NextRequest, NextResponse } from 'next/server'
import { AlertManager } from '@/lib/alerts'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const alertId = params.id

    // Try to find in live alerts
    const alertManager = new AlertManager()
    const liveAlerts = await alertManager.fetchAllAlerts()
    const liveAlert = liveAlerts.find(alert => alert.id === alertId)

    if (liveAlert) {
      return NextResponse.json({
        ...liveAlert,
        title: liveAlert.headline,
        description: liveAlert.description,
        time: liveAlert.startsAt,
        location: liveAlert.geometry?.type === 'Point' ?
          { lat: liveAlert.geometry.coordinates[1], lng: liveAlert.geometry.coordinates[0] } : null,
        image: getAlertImage(liveAlert.type)
      })
    }

    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

function getAlertImage(type: string): string {
  const imageMap: Record<string, string> = {
    'TSUNAMI': '/alerts/tsunami.jpg',
    'EARTHQUAKE': '/alerts/earthquake.jpg',
    'WILDFIRE': '/alerts/fire.jpg',
    'HURRICANE': '/alerts/hurricane.jpg',
    'FLOOD': '/alerts/flood.jpg',
    'VOLCANO': '/alerts/volcano.jpg'
  }

  return imageMap[type] || '/icons/icon-192.svg'
}

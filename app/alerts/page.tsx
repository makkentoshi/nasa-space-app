"use client"

import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'

interface Alert {
  id: string
  type: string
  severity: string
  headline: string
  description: string
  startsAt?: string
  createdAt?: string
  geometry?: any
  image?: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alerts')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Ensure data is an array
      setAlerts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const filterAlerts = useCallback(() => {
    if (selectedType === 'all') {
      setFilteredAlerts(alerts)
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.type.toLowerCase() === selectedType.toLowerCase()))
    }
  }, [alerts, selectedType])

  useEffect(() => {
    filterAlerts()
  }, [filterAlerts])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'destructive'
      case 'severe': return 'default'
      case 'moderate': return 'secondary'
      default: return 'outline'
    }
  }

  const getAlertImage = (type: string) => {
    const imageMap: Record<string, string> = {
      'tsunami': '/alerts/tsunami.svg',
      'earthquake': '/alerts/earthquake.svg',
      'wildfire': '/alerts/fire.svg',
      'hurricane': '/alerts/hurricane.svg',
      'flood': '/alerts/flood.svg',
      'volcano': '/alerts/volcano.svg'
    }
    return imageMap[type.toLowerCase()] || '/globe.svg'
  }

  const alertTypes = [
    { value: 'all', label: 'All Alerts', icon: AlertTriangle },
    { value: 'tsunami', label: 'Tsunami', icon: AlertTriangle },
    { value: 'earthquake', label: 'Earthquake', icon: AlertTriangle },
    { value: 'wildfire', label: 'Wildfire', icon: AlertTriangle },
    { value: 'hurricane', label: 'Hurricane', icon: AlertTriangle },
    { value: 'flood', label: 'Flood', icon: AlertTriangle },
    { value: 'volcano', label: 'Volcano', icon: AlertTriangle }
  ]

  return (
    <AppShell>
      <div className="min-h-screen p-4 bg-pwa-bg1">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Active Alerts</h1>
            <Button onClick={fetchAlerts} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 pb-2">
            {alertTypes.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={selectedType === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(value)}
                className="flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground">
                  {selectedType === 'all'
                    ? 'There are currently no active alerts in your area.'
                    : `No ${selectedType} alerts found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Link key={alert.id} href={`/alerts/${alert.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{alert.headline || alert.type}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.startsAt || alert.createdAt || Date.now()).toLocaleString()}
                            </span>
                            {alert.geometry?.type === 'Point' && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.geometry.coordinates[1].toFixed(2)}, {alert.geometry.coordinates[0].toFixed(2)}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-3 items-center">
                        <Image
                          src={alert.image || getAlertImage(alert.type)}
                          width={80}
                          height={48}
                          className="w-20 h-12 object-cover rounded"
                          alt={alert.headline || alert.type}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{alert.description || 'No description available'}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Type: {alert.type}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
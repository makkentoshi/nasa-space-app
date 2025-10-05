"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, Clock, Filter } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import Image from 'next/image'

interface Alert {
  id: string
  type: string
  severity: string
  headline: string
  description: string
  location?: {
    lat: number
    lng: number
    name: string
  }
  magnitude?: number
  time: string
  distance?: number
  tsunami: boolean
  image: string
}

export default function AlertTypePage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const alertType = decodeURIComponent(params.type)

  useEffect(() => {
    fetchAlerts()
  }, [alertType])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      
      // Fetch from emergency API
      const response = await fetch('/api/emergency/data?days=30&minMagnitude=3.0')
      const data = await response.json()
      
      if (data.success && data.alerts) {
        // Filter by type
        const filtered = data.alerts.filter(
          (alert: Alert) => alert.type.toLowerCase() === alertType.toLowerCase()
        )
        setAlerts(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'destructive'
      case 'severe': return 'default'
      case 'moderate': return 'secondary'
      case 'minor': return 'outline'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'earthquake': '/alerts/earthquake.svg',
      'tsunami': '/alerts/tsunami.svg',
      'wildfire': '/alerts/fire.svg',
      'hurricane': '/alerts/hurricane.svg',
      'flood': '/alerts/flood.svg',
      'volcano': '/alerts/volcano.svg'
    }
    return icons[type.toLowerCase()] || '/globe.svg'
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton onClick={() => router.back()} />

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Image
                src={getTypeIcon(alertType)}
                alt={alertType}
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold capitalize mb-2">
              {alertType} Alerts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {loading ? 'Loading...' : `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Filters/Actions */}
          <div className="mb-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAlerts}
              disabled={loading}
            >
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/alerts')}
            >
              View All Types
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
              </div>
            </div>
          )}

          {/* Alerts List */}
          {!loading && alerts.length > 0 && (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link key={alert.id} href={`/alerts/${alert.id}`}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Alert Icon */}
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex-shrink-0">
                          <Image
                            src={alert.image}
                            alt={alert.type}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Alert Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg capitalize">
                              {alert.type}
                            </h3>
                            <Badge variant={getSeverityColor(alert.severity) as any}>
                              {alert.severity}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                            {alert.headline}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {alert.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">
                                  {alert.location.name}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(alert.time).toLocaleString()}</span>
                            </div>
                            {alert.magnitude && (
                              <div className="font-semibold text-orange-600">
                                M {alert.magnitude}
                              </div>
                            )}
                            {alert.distance && (
                              <div className="font-semibold text-blue-600">
                                {alert.distance.toFixed(0)} km away
                              </div>
                            )}
                          </div>

                          {alert.tsunami && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              Tsunami Warning
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && alerts.length === 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">
                  No {alertType} Alerts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  There are currently no active {alertType} alerts in your area.
                </p>
                <Button onClick={() => router.push('/alerts')}>
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}

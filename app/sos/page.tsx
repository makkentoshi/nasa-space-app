"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { AppShell } from '@/components/layout/AppShell'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CTAButton from '@/components/ui/CTAButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Phone, MapPin, Clock, Shield, Bot } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store/useAppStore'
import { toast } from 'sonner'

interface EmergencyNumber {
  number: string
  label: string
  description: string
}

export default function SOSPage() {
  const router = useRouter()
  const { user } = useUser()
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumber[]>([])
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [country, setCountry] = useState('US')
  const location = useAppStore(state => state.location.location)
  const setEmergencyState = useAppStore(state => state.setEmergencyState)

  // Auto-detect user's country from locale if possible
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.language) {
        const m = navigator.language.match(/-([A-Z]{2})$/i)
        if (m && m[1]) {
          setCountry(m[1].toUpperCase())
          return
        }
      }

      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale
        const m = locale && locale.match(/-([A-Z]{2})$/i)
        if (m && m[1]) setCountry(m[1].toUpperCase())
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const fetchEmergencyNumbers = useCallback(async () => {
    try {
      // Mock emergency numbers directory per country
      const directory: Record<string, EmergencyNumber[]> = {
        US: [
          { number: '911', label: 'Emergency Services', description: 'Police, Fire, Medical Emergency' },
          { number: '311', label: 'Non-Emergency', description: 'Non-emergency city services' }
        ],
        GB: [
          { number: '999', label: 'Emergency Services', description: 'Police, Fire, Medical' },
          { number: '111', label: 'Non-Emergency', description: 'NHS Non-emergency' }
        ],
        IN: [
          { number: '112', label: 'Emergency Services', description: 'All-in-one emergency' },
        ]
      }

      setEmergencyNumbers(directory[country] || directory['US'])
    } catch (error) {
      console.error('Failed to fetch emergency numbers:', error)
      toast.error('Failed to load emergency numbers')
    }
  }, [country])

  const startEmergencyCountdown = () => {
    if (countdown) {
      // Cancel countdown and reset emergency states
      setCountdown(null)
      setIsEmergencyActive(false)
      setEmergencyState(false)
      toast.success('Emergency call cancelled')
      return
    }
    
    setCountdown(10)
    toast.warning('Emergency call starting in 10 seconds. Tap cancel to abort.')
    
    // Start location sharing immediately
    setIsEmergencyActive(true)
    setEmergencyState(true)
    startLocationSharing()
  }

  const startLocationSharing = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            // Send location ping
            await fetch('/api/ping', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lat: latitude,
                lng: longitude,
                accuracy: position.coords.accuracy,
                isFinalBeforeShutdown: false
              })
            })
          } catch (error) {
            console.error('Failed to send location ping:', error)
          }
        },
        (error) => {
          console.error('Location error:', error)
          toast.error('Location access denied')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }

  const sendEmergencyNotification = useCallback(async () => {
    try {
      // Notify emergency contacts and friends
      await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'sos_activated',
          location: location ? { lat: location.lat, lng: location.lng } : null
        })
      })
    } catch (error) {
      console.error('Failed to send emergency notification:', error)
    }
  }, [location])

  const handleEmergencyCall = useCallback(() => {
    const primaryNumber = emergencyNumbers[0]?.number || '911'
    
    // Make the call
    window.location.href = `tel:${primaryNumber}`
    
    // Send emergency notification
    sendEmergencyNotification()
    
    // Reset countdown but keep emergency mode active
    setCountdown(null)
    
    toast.success(`Calling ${primaryNumber}`)
  }, [emergencyNumbers, sendEmergencyNotification])

  const stopEmergency = () => {
    setIsEmergencyActive(false)
    setEmergencyState(false)
    setCountdown(null)
    toast.success('Emergency mode deactivated')
  }

  const toggleEmergencyMode = () => {
    const newState = !isEmergencyActive
    setIsEmergencyActive(newState)
    setEmergencyState(newState)
    
    if (newState) {
      startLocationSharing()
      toast.success('Emergency mode activated')
    } else {
      toast.success('Emergency mode deactivated')
    }
  }

  // Load emergency numbers when country changes
  useEffect(() => {
    fetchEmergencyNumbers()
  }, [country, fetchEmergencyNumbers])

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (countdown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev ? prev - 1 : 0)
      }, 1000)
    } else if (countdown === 0) {
      handleEmergencyCall()
      setCountdown(null)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdown, handleEmergencyCall])

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 pb-28 overflow-x-hidden">
        <BackButton onClick={() => router.back()} />
        {/* Emergency Status */}
        {isEmergencyActive && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Emergency mode is active. Your location is being shared with emergency contacts.
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={stopEmergency}
              >
                Deactivate
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">Emergency SOS</h1>
          <p className="text-base text-foreground">
            Quick access to emergency services in your region
          </p>
        </div>

        {/* Primary Emergency Button */}
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            {countdown ? (
              <div className="space-y-4">
                <div className="text-6xl font-bold text-red-600 tabular-nums">
                  {countdown}
                </div>
                <p className="text-lg font-medium text-red-700">
                  Calling emergency services in {countdown} seconds
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-red-600 border-red-300 hover:bg-red-50"
                  onClick={startEmergencyCountdown}
                >
                  Cancel Emergency Call
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm">Country</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="p-2 rounded border w-full md:w-auto"
                    aria-label="Select country"
                  >
{[
  'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR','IO','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CN','CX','CC','CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','ET','FK','FO','FJ','FI','FR','GF','PF','TF','GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT','HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MO','MK','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO','TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU','VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
].map(code => {
  let name = code
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' })
    name = dn.of(code) || code
  } catch (e) {
    name = code
  }
  return (
    <option key={code} value={code}>
      {name}
    </option>
  )
})}
+                  </select>
                </div>
                <CTAButton
                  onClick={startEmergencyCountdown}
                  className="flex items-center justify-center text-white text-xl py-10 w-full rounded-2xl flex-row relative "
                  variant="danger"
                  aria-label="Start SOS emergency call"
                >
                  <Phone className="h-5 w-5 absolute text-white left-10 bottom-3" />
                  <span className="text-white">SOS Emergency Call</span>
                </CTAButton>
                
                {/* Manual Emergency Mode Toggle */}
                <div className="mt-4">
                  <Button
                    onClick={toggleEmergencyMode}
                    variant={isEmergencyActive ? "default" : "outline"}
                    className={`w-full py-3 ${
                      isEmergencyActive 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                    aria-label={isEmergencyActive ? "Deactivate emergency mode" : "Activate emergency mode"}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {isEmergencyActive ? "Deactivate Emergency Mode" : "Activate Emergency Mode"}
                  </Button>
                </div>
                <div className="mt-2">
                  <Link href="/chatgpt" className="inline-flex items-center gap-2 text-sm text-foreground hover:underline">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    Chat with ChatGPT
                  </Link>
                </div>
                <p className="text-sm text-foreground">
                  Press to start 10-second countdown. Tap again to cancel.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Emergency Mode:</strong> Shares your location with contacts without calling emergency services.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>
              Region-specific emergency services for your location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyNumbers.map((emergency, index) => (
              <div
                key={emergency.number}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  index === 0 ? 'border-red-200 bg-red-50' : 'border-border'
                }`}
              >
                <div>
                  <h3 className={`font-semibold ${index === 0 ? 'text-red-700' : 'text-foreground'}`}>
                    {emergency.label}
                  </h3>
                  <p className={`text-sm ${index === 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {emergency.description}
                  </p>
                </div>
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  className={index === 0 ? "bg-red-600 hover:bg-red-700" : ""}
                  onClick={() => window.location.href = `tel:${emergency.number}`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {emergency.number}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">
                  ✓ Location services active
                </p>
                <p className="text-xs text-muted-foreground">
                  Your location will be shared with emergency services when SOS is activated
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 font-medium">
                  ⚠ Location access required
                </p>
                <p className="text-xs text-muted-foreground">
                  Enable location services for emergency services to find you quickly
                </p>
                <Button size="sm" variant="outline">
                  Enable Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <p>
              <strong>When to call emergency services:</strong> Life-threatening emergencies, 
              fires, serious injuries, crimes in progress, or immediate safety threats.
            </p>
            <p>
              <strong>SOS Emergency Call:</strong> Places an immediate call to emergency services 
              and activates location sharing with contacts.
            </p>
            <p>
              <strong>Emergency Mode:</strong> Shares your location with emergency contacts 
              without calling emergency services. Use when you need help but it&apos;s not life-threatening.
            </p>
            <p>
              <strong>What happens when you activate either mode:</strong> Your location is immediately 
              shared with emergency contacts, and notifications are sent to your friends.
            </p>
            <p>
              <strong>False alarms:</strong> If you accidentally trigger SOS, stay on the line and explain it was a mistake to avoid unnecessary emergency response.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
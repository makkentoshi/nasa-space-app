'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Bell, BellOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PushNotificationManager() {
  const { isSupported, isSubscribed, permission, requestPermission, subscribe, unsubscribe } = usePushNotifications()
  const { toast } = useToast()

  const handleToggle = async () => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive'
      })
      return
    }

    if (permission === 'default') {
      const granted = await requestPermission()
      if (granted) {
        const success = await subscribe()
        if (success) {
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive push notifications for alerts.'
          })
        }
      }
    } else if (permission === 'granted') {
      if (isSubscribed) {
        const success = await unsubscribe()
        if (success) {
          toast({
            title: 'Notifications Disabled',
            description: 'You will no longer receive push notifications.'
          })
        }
      } else {
        const success = await subscribe()
        if (success) {
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive push notifications for alerts.'
          })
        }
      }
    } else {
      toast({
        title: 'Permission Required',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive'
      })
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive real-time alerts for emergencies and threats in your area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Emergency Alerts</p>
            <p className="text-xs text-muted-foreground">
              Get notified about earthquakes, floods, and other threats
            </p>
          </div>
          <Switch
            checked={permission === 'granted' && isSubscribed}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <div className="text-xs text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </div>
        )}

        {permission === 'default' && (
          <Button onClick={handleToggle} size="sm">
            Enable Notifications
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
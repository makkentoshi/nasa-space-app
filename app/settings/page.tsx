"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellOff, 
  Clock, 
  Brain, 
  AlertTriangle, 
  Cloud, 
  Shield,
  Sun,
  Moon,
  Sunrise,
  Save,
  User,
  MapPin,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react'
import { toast } from 'sonner'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'

interface NotificationSettings {
  // Push Notifications
  pushEnabled: boolean
  emergencyAlerts: boolean
  forecastAlerts: boolean
  behaviorAlerts: boolean
  
  // Daily AI Briefing
  dailyBriefingEnabled: boolean
  briefingTime: string // HH:MM format
  briefingDays: number[] // 0=Sunday, 1=Monday, etc.
  
  // Weather Notifications
  weatherUpdates: boolean
  severeWeatherOnly: boolean
  comfortIndexAlerts: boolean
  
  // Behavior Predictions
  routeAlerts: boolean
  proactiveWarnings: boolean
  optimizationTips: boolean
  
  // Quiet Hours
  quietHoursEnabled: boolean
  quietStart: string
  quietEnd: string
}

const defaultSettings: NotificationSettings = {
  pushEnabled: false,
  emergencyAlerts: true,
  forecastAlerts: true,
  behaviorAlerts: true,
  
  dailyBriefingEnabled: true,
  briefingTime: '08:00',
  briefingDays: [1, 2, 3, 4, 5], // Weekdays
  
  weatherUpdates: true,
  severeWeatherOnly: false,
  comfortIndexAlerts: true,
  
  routeAlerts: true,
  proactiveWarnings: true,
  optimizationTips: true,
  
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00'
}

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported', {
        description: 'Your browser does not support push notifications'
      })
      return
    }

    const permission = await Notification.requestPermission()
    setPermissionStatus(permission)
    
    if (permission === 'granted') {
      updateSetting('pushEnabled', true)
      toast.success('Notifications enabled!', {
        description: 'You will now receive push notifications'
      })
    } else if (permission === 'denied') {
      toast.error('Permission denied', {
        description: 'Please enable notifications in your browser settings'
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('notification-settings', JSON.stringify(settings))
      
      // In production, save to backend
      if (user) {
        const response = await fetch('/api/user/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            settings
          })
        })
        
        if (!response.ok) {
          console.warn('Failed to sync settings with server')
        }
      }
      
      // Schedule daily briefing if enabled
      if (settings.dailyBriefingEnabled && settings.pushEnabled) {
        await scheduleDailyBriefing(settings.briefingTime, settings.briefingDays)
      }
      
      toast.success('Settings saved!', {
        description: 'Your notification preferences have been updated'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', {
        description: 'Please try again'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const scheduleDailyBriefing = async (time: string, days: number[]) => {
    // Register service worker task for daily briefing
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      console.log('Scheduled daily briefing for', time, 'on days', days)
      // In production, use Service Worker API or backend scheduler
    }
  }

  const testNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('resQ Test Notification', {
        body: 'This is a test notification from resQ. Weather alerts and AI briefings will appear like this.',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-96.svg',
        tag: 'test'
      })
      toast.success('Test notification sent!')
    } else {
      toast.error('Notifications not enabled', {
        description: 'Please enable notifications first'
      })
    }
  }

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[day]
  }

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen">
        {/* Header */}
        <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-[#53B175]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">Manage your notifications and preferences</p>
        </div>

        {/* Back Button */}
        <div className="mb-4">
          <BackButton onClick={() => router.back()} />
        </div>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="ai-briefing">
              <Brain className="h-4 w-4 mr-2" />
              AI Briefing
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Zap className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {/* Push Notification Status */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {permissionStatus === 'granted' ? (
                    <Bell className="h-5 w-5 text-green-600" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-gray-900">Push Notifications</span>
                  {permissionStatus === 'granted' && (
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  )}
                  {permissionStatus === 'denied' && (
                    <Badge variant="destructive">Blocked</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Receive real-time alerts and weather updates on this device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {permissionStatus === 'default' && (
                  <Button onClick={requestNotificationPermission} className="w-full bg-[#53B175] hover:bg-[#4a9c65]">
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Push Notifications
                  </Button>
                )}
                
                {permissionStatus === 'granted' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Emergency Alerts</p>
                        <p className="text-xs text-muted-foreground">
                          Earthquakes, tsunamis, wildfires, and other threats
                        </p>
                      </div>
                      <Switch
                        checked={settings.emergencyAlerts}
                        onCheckedChange={(checked) => updateSetting('emergencyAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Forecast Alerts</p>
                        <p className="text-xs text-muted-foreground">
                          Weather changes and comfort index updates
                        </p>
                      </div>
                      <Switch
                        checked={settings.forecastAlerts}
                        onCheckedChange={(checked) => updateSetting('forecastAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Behavior Predictions</p>
                        <p className="text-xs text-muted-foreground">
                          Route weather warnings and proactive tips
                        </p>
                      </div>
                      <Switch
                        checked={settings.behaviorAlerts}
                        onCheckedChange={(checked) => updateSetting('behaviorAlerts', checked)}
                      />
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={testNotification}
                      className="w-full"
                    >
                      Send Test Notification
                    </Button>
                  </>
                )}

                {permissionStatus === 'denied' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800 mb-2 font-medium">Notifications Blocked</p>
                    <p className="text-xs text-red-700">
                      To enable notifications, please update your browser settings for this site.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weather Updates */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-900">Weather Updates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Weather Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Regular weather condition updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.weatherUpdates}
                    onCheckedChange={(checked) => updateSetting('weatherUpdates', checked)}
                    disabled={!settings.pushEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Severe Weather Only</p>
                    <p className="text-xs text-muted-foreground">
                      Only notify for severe weather conditions
                    </p>
                  </div>
                  <Switch
                    checked={settings.severeWeatherOnly}
                    onCheckedChange={(checked) => updateSetting('severeWeatherOnly', checked)}
                    disabled={!settings.weatherUpdates || !settings.pushEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Comfort Index Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when comfort index changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.comfortIndexAlerts}
                    onCheckedChange={(checked) => updateSetting('comfortIndexAlerts', checked)}
                    disabled={!settings.pushEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Briefing Tab */}
          <TabsContent value="ai-briefing" className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-900">Daily AI Weather Briefing</span>
                </CardTitle>
                <CardDescription>
                  Get a personalized weather overview and AI recommendations every morning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Enable Daily Briefing</p>
                    <p className="text-xs text-muted-foreground">
                      Receive AI-powered weather insights and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings.dailyBriefingEnabled}
                    onCheckedChange={(checked) => updateSetting('dailyBriefingEnabled', checked)}
                    disabled={!settings.pushEnabled}
                  />
                </div>

                {settings.dailyBriefingEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Briefing Time
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={settings.briefingTime}
                          onChange={(e) => updateSetting('briefingTime', e.target.value)}
                          className="flex-1"
                        />
                        <Badge variant="outline">
                          {new Date(`2000-01-01T${settings.briefingTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You'll receive your briefing every day at this time
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Active Days</Label>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map(day => {
                          const isActive = settings.briefingDays.includes(day)
                          return (
                            <Button
                              key={day}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (isActive) {
                                  updateSetting('briefingDays', settings.briefingDays.filter(d => d !== day))
                                } else {
                                  updateSetting('briefingDays', [...settings.briefingDays, day].sort())
                                }
                              }}
                              className={isActive ? "bg-[#53B175] hover:bg-[#4a9c65]" : ""}
                            >
                              {getDayName(day)}
                            </Button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select which days you want to receive briefings
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <p className="text-sm font-medium text-blue-900">What's Included:</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Today's weather overview with high/low temperatures
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Comfort index and outdoor activity recommendations
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Behavior predictions for your saved routes
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Proactive warnings for weather impacts
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          AI-powered tips for optimal planning
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                {!settings.pushEnabled && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800">
                      Enable push notifications first to receive daily briefings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Behavior Prediction Settings */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900">Route & Behavior Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Route Weather Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Notify about weather on your saved routes
                    </p>
                  </div>
                  <Switch
                    checked={settings.routeAlerts}
                    onCheckedChange={(checked) => updateSetting('routeAlerts', checked)}
                    disabled={!settings.pushEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Proactive Warnings</p>
                    <p className="text-xs text-muted-foreground">
                      Get warnings before weather impacts your plans
                    </p>
                  </div>
                  <Switch
                    checked={settings.proactiveWarnings}
                    onCheckedChange={(checked) => updateSetting('proactiveWarnings', checked)}
                    disabled={!settings.pushEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Optimization Tips</p>
                    <p className="text-xs text-muted-foreground">
                      Receive AI suggestions for better timing
                    </p>
                  </div>
                  <Switch
                    checked={settings.optimizationTips}
                    onCheckedChange={(checked) => updateSetting('optimizationTips', checked)}
                    disabled={!settings.pushEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-900">Quiet Hours</span>
                </CardTitle>
                <CardDescription>
                  Pause non-critical notifications during specific hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Enable Quiet Hours</p>
                    <p className="text-xs text-muted-foreground">
                      Emergency alerts will still come through
                    </p>
                  </div>
                  <Switch
                    checked={settings.quietHoursEnabled}
                    onCheckedChange={(checked) => updateSetting('quietHoursEnabled', checked)}
                  />
                </div>

                {settings.quietHoursEnabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Time</Label>
                        <Input
                          type="time"
                          value={settings.quietStart}
                          onChange={(e) => updateSetting('quietStart', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">End Time</Label>
                        <Input
                          type="time"
                          value={settings.quietEnd}
                          onChange={(e) => updateSetting('quietEnd', e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Quiet hours: {settings.quietStart} - {settings.quietEnd}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="rounded-2xl shadow-sm border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Reset Settings</span>
                </CardTitle>
                <CardDescription>
                  Reset all notification settings to default
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setSettings(defaultSettings)
                    toast.success('Settings reset to default')
                  }}
                  className="w-full"
                >
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-pwa-bg2 via-pwa-bg2 to-transparent pt-6 md:hidden">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#53B175] hover:bg-[#4a9c65] text-white font-bold py-6 text-lg shadow-lg"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Desktop Save Button */}
        <div className="hidden md:block mt-6">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#53B175] hover:bg-[#4a9c65] text-white font-bold py-4"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

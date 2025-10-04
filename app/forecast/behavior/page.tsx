"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import BehaviorPredictionManager from '@/components/BehaviorPredictionManager'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Settings, 
  Bell, 
  Clock, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Sun,
  Target,
  Zap,
  TrendingUp,
  MapPin,
  Navigation,
  Lightbulb,
  Sparkles,
  CloudSnow
} from 'lucide-react'
import { WiDaySunny } from 'react-icons/wi'

export default function BehaviorPredictionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('routes') // routes, settings, insights, locations
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string} | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const [globalSettings, setGlobalSettings] = useState({
    smart_alerts_enabled: true,
    proactive_notifications: true,
    learning_mode: true,
    advance_warning_hours: 2,
    comfort_priority: 'medium',
    weather_thresholds: {
      temperature_range: [65, 80], // °F
      max_rain: 0.1, // inches
      max_wind: 20, // mph
      uv_sensitivity: 'medium'
    }
  })

  const updateSetting = (key: string, value: any) => {
    setGlobalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen">
        {/* Header */}
        <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-[#3B82F6]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Behavior Prediction</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">AI learns your routines and predicts weather impact</p>
        </div>

        {/* Navigation */}
        <div className="mb-4">
          <Link href="/forecast" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Forecast
          </Link>
        </div>

        {/* Quick Stats Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            AI Performance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 text-white shadow hover:shadow-lg transition">
              <Target className="h-6 w-6 mb-2" />
              <div className="text-2xl font-bold">87%</div>
              <div className="text-xs opacity-90">Accuracy</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 p-4 text-white shadow hover:shadow-lg transition">
              <Zap className="h-6 w-6 mb-2" />
              <div className="text-2xl font-bold">24</div>
              <div className="text-xs opacity-90">Alerts</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 p-4 text-white shadow hover:shadow-lg transition">
              <Navigation className="h-6 w-6 mb-2" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs opacity-90">Routes</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'routes', label: 'Smart Routes', icon: Navigation },
                { id: 'locations', label: 'Locations', icon: MapPin },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'insights', label: 'AI Insights', icon: Sparkles }
              ].map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'routes' && (
            <div className="space-y-4">
              {/* AI Learning Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">AI Learning Active</h3>
                </div>
                <p className="text-sm text-gray-600">Your movement patterns are being analyzed to provide better weather predictions and route optimization.</p>
              </div>

              <BehaviorPredictionManager />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-4">
              {/* Location Analysis Header */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Location & Time Analysis</h3>
                </div>
                <p className="text-sm text-gray-600">Analyze weather patterns for specific locations using interactive map selection</p>
              </div>

              {/* Location Picker */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <Button 
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedLocation ? `Selected: ${selectedLocation.name}` : 'Select Location on Map'}
                </Button>
                
                {selectedLocation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{selectedLocation.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Pattern Analysis */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Time Patterns</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-900 mb-1">Morning Peak</div>
                    <div className="text-xs text-gray-600">08:00-09:00 • Weekdays • High activity</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-900 mb-1">Evening Commute</div>
                    <div className="text-xs text-gray-600">17:30-18:30 • Weekdays • Moderate activity</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-900 mb-1">Weekend Activities</div>
                    <div className="text-xs text-gray-600">09:00-14:00 • Saturdays • Outdoor preference</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Notification Settings */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-900">Notification Settings</span>
                  </CardTitle>
                  <CardDescription>Configure how and when you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-sm">Smart Alerts</h4>
                        <p className="text-xs text-gray-600">Get weather warnings for your routes</p>
                      </div>
                      <Switch
                        checked={globalSettings.smart_alerts_enabled}
                        onCheckedChange={(checked) => updateSetting('smart_alerts_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-sm">Proactive Notifications</h4>
                        <p className="text-xs text-gray-600">AI suggests plan changes before bad weather</p>
                      </div>
                      <Switch
                        checked={globalSettings.proactive_notifications}
                        onCheckedChange={(checked) => updateSetting('proactive_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-sm">Learning Mode</h4>
                        <p className="text-xs text-gray-600">Allow AI to track patterns automatically</p>
                      </div>
                      <Switch
                        checked={globalSettings.learning_mode}
                        onCheckedChange={(checked) => updateSetting('learning_mode', checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <Label className="text-sm font-medium">Advance Warning Time</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Slider
                        value={[globalSettings.advance_warning_hours]}
                        onValueChange={([value]) => updateSetting('advance_warning_hours', value)}
                        min={1}
                        max={24}
                        step={1}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-sm">{globalSettings.advance_warning_hours}h</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Comfort Thresholds */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-900">Weather Comfort Thresholds</span>
                  </CardTitle>
                  <CardDescription>Set your personal weather comfort preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature Range (°F)
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-600 w-8">{globalSettings.weather_thresholds.temperature_range[0]}°</span>
                      <Slider
                        value={globalSettings.weather_thresholds.temperature_range}
                        onValueChange={(values) => updateSetting('weather_thresholds', {
                          ...globalSettings.weather_thresholds,
                          temperature_range: values
                        })}
                        min={32}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-600 w-8">{globalSettings.weather_thresholds.temperature_range[1]}°</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CloudRain className="h-4 w-4" />
                      Max Acceptable Rain (inches)
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Slider
                        value={[globalSettings.weather_thresholds.max_rain]}
                        onValueChange={([value]) => updateSetting('weather_thresholds', {
                          ...globalSettings.weather_thresholds,
                          max_rain: value
                        })}
                        min={0}
                        max={2}
                        step={0.1}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-sm">{globalSettings.weather_thresholds.max_rain}"</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      Max Acceptable Wind (mph)
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Slider
                        value={[globalSettings.weather_thresholds.max_wind]}
                        onValueChange={([value]) => updateSetting('weather_thresholds', {
                          ...globalSettings.weather_thresholds,
                          max_wind: value
                        })}
                        min={0}
                        max={50}
                        step={5}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-sm">{globalSettings.weather_thresholds.max_wind} mph</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      UV Sensitivity
                    </Label>
                    <Select
                      value={globalSettings.weather_thresholds.uv_sensitivity}
                      onValueChange={(value) => updateSetting('weather_thresholds', {
                        ...globalSettings.weather_thresholds,
                        uv_sensitivity: value
                      })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Rarely concerned</SelectItem>
                        <SelectItem value="medium">Medium - Normal precautions</SelectItem>
                        <SelectItem value="high">High - Always careful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              {/* AI Performance */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">AI Performance Metrics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">How well AI predicts your behavior and weather impact</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-xl font-bold text-green-600">87%</div>
                    <div className="text-xs text-gray-600">Route Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-xl font-bold text-blue-600">92%</div>
                    <div className="text-xs text-gray-600">Time Prediction</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-xl font-bold text-purple-600">73%</div>
                    <div className="text-xs text-gray-600">Plan Changes</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-xl font-bold text-orange-600">85%</div>
                    <div className="text-xs text-gray-600">Data Quality</div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Usage Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-xs text-blue-700">Tracked Trips</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">24</div>
                    <div className="text-xs text-green-700">Alerts Sent</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">18</div>
                    <div className="text-xs text-orange-700">Plans Changed</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">3.2</div>
                    <div className="text-xs text-purple-700">Hours Saved</div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">AI Learning Insights</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">What the AI has discovered about your patterns</p>
                
                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900 text-sm">Activity Profile</span>
                    </div>
                    <p className="text-blue-800 text-sm">
                      You&apos;re most active mornings (8:00-9:00) and evenings (17:30-18:30). 
                      You prefer driving in bad weather, cycling in good weather.
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-900 text-sm">Weather Sensitivity</span>
                    </div>
                    <p className="text-green-800 text-sm">
                      Rain increases your travel time by 12 minutes on average.
                      You avoid outdoor activities when temperature exceeds 85°F.
                    </p>
                  </div>

                  <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-purple-900 text-sm">Recommendation Impact</span>
                    </div>
                    <p className="text-purple-800 text-sm">
                      You follow our recommendations 78% of the time. 
                      This saved you 3.2 hours of weather delays last month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

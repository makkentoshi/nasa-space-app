"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  MapPin, 
  Download, 
  AlertCircle,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Activity
} from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'

// Kazakhstan cities data
const kazakhstanCities = [
  { name: 'Astana', country: 'Kazakhstan', lat: 51.1694, lng: 71.4491 },
  { name: 'Almaty', country: 'Kazakhstan', lat: 43.2220, lng: 76.8512 },
  { name: 'Shymkent', country: 'Kazakhstan', lat: 42.3417, lng: 69.5901 },
  { name: 'Karaganda', country: 'Kazakhstan', lat: 49.8047, lng: 73.1094 },
  { name: 'Aktobe', country: 'Kazakhstan', lat: 50.2797, lng: 57.2072 },
  { name: 'Taraz', country: 'Kazakhstan', lat: 42.9000, lng: 71.3667 },
  { name: 'Pavlodar', country: 'Kazakhstan', lat: 52.2873, lng: 76.9674 },
  { name: 'Ust-Kamenogorsk', country: 'Kazakhstan', lat: 49.9484, lng: 82.6277 },
  { name: 'Semey', country: 'Kazakhstan', lat: 50.4111, lng: 80.2275 },
  { name: 'Oral', country: 'Kazakhstan', lat: 51.2333, lng: 51.3667 },
  { name: 'Atyrau', country: 'Kazakhstan', lat: 47.1064, lng: 51.9227 },
  { name: 'Kostanay', country: 'Kazakhstan', lat: 53.2007, lng: 63.6250 },
  { name: 'Kyzylorda', country: 'Kazakhstan', lat: 44.8479, lng: 65.4822 },
  { name: 'Aktau', country: 'Kazakhstan', lat: 43.6500, lng: 51.2000 },
  { name: 'Petropavl', country: 'Kazakhstan', lat: 54.8667, lng: 69.1500 },
]

export default function ForecastStatsPage() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState('Pavlodar')
  const [variable, setVariable] = useState('precipitation')
  const [loading, setLoading] = useState(false)
  const [statsData, setStatsData] = useState<any>(null)

  // Mock statistical data
  const mockStats = {
    variable: 'Precipitation',
    units: 'mm',
    n_years: 23,
    mean: 15.2,
    median: 12.8,
    std: 8.4,
    percentiles: { p10: 2.1, p25: 7.3, p50: 12.8, p75: 20.1, p90: 28.5, p95: 34.2 },
    p_exceed: 0.35,
    p_exceed_CI: [0.28, 0.42],
    trend: { slope: 0.23, p_value: 0.045, method: 'Mann-Kendall' },
    baseline_vs_recent: { p_exceed_baseline: 0.31, p_exceed_recent: 0.39, delta_percent: 25.8 },
    source: [
      { dataset: 'GPM IMERG', url: 'https://disc.gsfc.nasa.gov', doi: '10.5067/GPM/IMERG/3B-HH/06', resolution: '0.1°' }
    ],
    caveats: 'Based on satellite estimates; ground validation may vary'
  }

  const variables = [
    { value: 'precipitation', label: 'Precipitation', unit: 'mm', icon: Droplets, color: 'text-blue-600' },
    { value: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: 'text-orange-600' },
    { value: 'wind', label: 'Wind Speed', unit: 'km/h', icon: Wind, color: 'text-sky-600' },
    { value: 'humidity', label: 'Humidity', unit: '%', icon: Cloud, color: 'text-indigo-600' }
  ]

  const handleAnalyze = async () => {
    setLoading(true)
    const city = kazakhstanCities.find(c => c.name === selectedCity)
    if (!city) return

    // Simulate API call
    setTimeout(() => {
      setStatsData({
        ...mockStats,
        location: `${city.name}, ${city.country}`,
        coordinates: { lat: city.lat, lng: city.lng }
      })
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    // Auto-load data for default city
    handleAnalyze()
  }, [])

  const selectedVar = variables.find(v => v.value === variable)
  const Icon = selectedVar?.icon || Activity

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-4 relative">
            <BackButton onClick={() => router.back()} />
            <PageHeader
              title="Statistical Analysis"
              subtitle="Detailed climatological statistics based on NASA satellite data"
              icon={<BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
              bgColor="transparent"
              textColor="#2563eb"
            />
          </div>

          {/* Controls */}
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="bg-white dark:bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kazakhstanCities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}, {city.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Variable
                  </label>
                  <Select value={variable} onValueChange={setVariable}>
                    <SelectTrigger className="bg-white dark:bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {variables.map((v) => {
                        const VIcon = v.icon
                        return (
                          <SelectItem key={v.value} value={v.value}>
                            <div className="flex items-center gap-2">
                              <VIcon className={`w-4 h-4 ${v.color}`} />
                              {v.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium opacity-0">Action</label>
                  <Button 
                    onClick={handleAnalyze} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {statsData && (
            <>
              {/* Location Info */}
              <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6" />
                    <div>
                      <h2 className="text-2xl font-bold">{statsData.location}</h2>
                      <p className="text-blue-100">
                        {statsData.coordinates.lat.toFixed(4)}°N, {statsData.coordinates.lng.toFixed(4)}°E
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Icon className="w-5 h-5" />
                    <span className="text-lg font-semibold">{selectedVar?.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {statsData.n_years} years of data
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mean</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsData.mean}
                    </div>
                    <div className="text-xs text-gray-500">{statsData.units}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Median</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsData.median}
                    </div>
                    <div className="text-xs text-gray-500">{statsData.units}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Std Dev</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsData.std}
                    </div>
                    <div className="text-xs text-gray-500">{statsData.units}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trend</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      +{statsData.trend.slope}
                    </div>
                    <div className="text-xs text-gray-500">per decade</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Percentiles */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Percentile Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(statsData.percentiles).map(([percentile, value]: [string, any]) => {
                        const percent = parseInt(percentile.substring(1))
                        return (
                          <div key={percentile} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {percent}th Percentile
                              </span>
                              <span className="text-sm font-bold">
                                {value} {statsData.units}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-indigo-600 h-2 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Climate Change Analysis */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      Climate Change Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Baseline Period (2001-2010)
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {(statsData.baseline_vs_recent.p_exceed_baseline * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">exceedance probability</div>
                      </div>

                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Recent Period (2014-2023)
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {(statsData.baseline_vs_recent.p_exceed_recent * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">exceedance probability</div>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between">
                        <span className="text-sm font-medium">Change:</span>
                        <Badge 
                          variant={statsData.baseline_vs_recent.delta_percent > 0 ? "destructive" : "default"}
                          className="text-base px-3 py-1"
                        >
                          {statsData.baseline_vs_recent.delta_percent > 0 ? '+' : ''}
                          {statsData.baseline_vs_recent.delta_percent.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistical Test */}
              <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Method
                      </div>
                      <Badge variant="outline" className="text-base">
                        {statsData.trend.method}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Slope
                      </div>
                      <div className="text-xl font-bold flex items-center gap-2">
                        {statsData.trend.slope > 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        {statsData.trend.slope > 0 ? '+' : ''}{statsData.trend.slope} {statsData.units}/decade
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        P-Value
                      </div>
                      <div className="text-xl font-bold">
                        {statsData.trend.p_value}
                        {statsData.trend.p_value < 0.05 && (
                          <Badge variant="default" className="ml-2">Significant</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Data Sources & Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statsData.source.map((source: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="default" className="bg-blue-600">
                            {source.dataset}
                          </Badge>
                          <Badge variant="secondary">
                            Resolution: {source.resolution}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">DOI:</span> {source.doi}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">URL:</span>{' '}
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {source.url}
                            </a>
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          Important Notes
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {statsData.caveats}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-600" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Time Series
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
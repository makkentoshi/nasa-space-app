"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Calendar, MapPin, Download, AlertCircle } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'

export default function ForecastStatsPage() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [variable, setVariable] = useState('precipitation')
  const [dayOfYear, setDayOfYear] = useState('180')
  const [threshold, setThreshold] = useState('20')

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
    { value: 'precipitation', label: 'Precipitation', unit: 'mm' },
    { value: 'temperature', label: 'Temperature', unit: '°C' },
    { value: 'wind', label: 'Wind Speed', unit: 'km/h' },
    { value: 'humidity', label: 'Humidity', unit: '%' }
  ]

  const handleAnalyze = () => {
    console.log('Analyzing:', { location, variable, dayOfYear, threshold })
    // TODO: Call API endpoint /api/forecast/statistics
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackButton onClick={() => router.back()} />
      
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Statistical Analysis</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Detailed climatological statistics based on NASA satellite data
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Location</label>
            <Input
              placeholder="Lat, Lon"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Variable</label>
            <Select value={variable} onValueChange={setVariable}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variables.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Day of Year</label>
            <Input
              type="number"
              placeholder="1-365"
              value={dayOfYear}
              onChange={(e) => setDayOfYear(e.target.value)}
              min="1"
              max="365"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Threshold</label>
            <Input
              type="number"
              placeholder="Value"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium opacity-0">Action</label>
            <Button onClick={handleAnalyze} className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-4 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mean Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.mean} {mockStats.units}</div>
              <p className="text-xs text-muted-foreground">Average over {mockStats.n_years} years</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Median</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.median} {mockStats.units}</div>
              <p className="text-xs text-muted-foreground">50th percentile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Exceedance Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(mockStats.p_exceed * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                CI: {(mockStats.p_exceed_CI[0] * 100).toFixed(1)}%-{(mockStats.p_exceed_CI[1] * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">+{mockStats.trend.slope}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {mockStats.units}/decade (p={mockStats.trend.p_value})
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Percentiles */}
          <Card>
            <CardHeader>
              <CardTitle>Percentile Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(mockStats.percentiles).map(([percentile, value]) => (
                  <div key={percentile} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{percentile.toUpperCase()}:</span>
                    <span className="text-sm">{value} {mockStats.units}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Climate Change Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Climate Change Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Baseline Period (2001-2010):</span>
                  <div className="text-lg font-bold">
                    {(mockStats.baseline_vs_recent.p_exceed_baseline * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Recent Period (2014-2023):</span>
                  <div className="text-lg font-bold">
                    {(mockStats.baseline_vs_recent.p_exceed_recent * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Badge variant={mockStats.baseline_vs_recent.delta_percent > 0 ? "destructive" : "default"}>
                    {mockStats.baseline_vs_recent.delta_percent > 0 ? '+' : ''}
                    {mockStats.baseline_vs_recent.delta_percent.toFixed(1)}% change
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Data Sources & Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStats.source.map((source, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{source.dataset}</Badge>
                    <Badge variant="secondary">Resolution: {source.resolution}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    DOI: {source.doi}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: {source.url}
                  </p>
                </div>
              ))}
              
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Caveats</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">{mockStats.caveats}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Time Series
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Metadata
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
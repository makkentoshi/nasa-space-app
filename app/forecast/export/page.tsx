"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Database, Map, MapPin, CheckCircle } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'

interface ExportJob {
  id: string
  format: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  createdAt: Date
}

export default function ForecastExportPage() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [dateRange, setDateRange] = useState({ start: '2001', end: '2023' })
  const [variables, setVariables] = useState(['precipitation'])
  const [format, setFormat] = useState('csv')
  const [bbox, setBbox] = useState({ north: '', south: '', east: '', west: '' })
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])

  const availableVariables = [
    { id: 'precipitation', label: 'Precipitation', size: '~2.3 MB' },
    { id: 'temperature', label: 'Temperature', size: '~1.8 MB' },
    { id: 'wind', label: 'Wind Speed', size: '~1.5 MB' },
    { id: 'humidity', label: 'Humidity', size: '~1.9 MB' }
  ]

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values for spreadsheets' },
    { value: 'json', label: 'JSON', icon: Database, description: 'Structured data format for APIs' },
    { value: 'geotiff', label: 'GeoTIFF', icon: Map, description: 'Raster format for GIS applications' },
    { value: 'netcdf', label: 'NetCDF', icon: Database, description: 'Scientific data format' }
  ]

  const handleVariableChange = (variableId: string, checked: boolean) => {
    if (checked) {
      setVariables([...variables, variableId])
    } else {
      setVariables(variables.filter(v => v !== variableId))
    }
  }

  const handleExport = () => {
    const newJob: ExportJob = {
      id: `job_${Date.now()}`,
      format,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    }

    setExportJobs([newJob, ...exportJobs])

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setExportJobs(jobs => 
          jobs.map(job => 
            job.id === newJob.id 
              ? { ...job, status: 'completed', progress: 100, downloadUrl: '#' }
              : job
          )
        )
      } else {
        setExportJobs(jobs => 
          jobs.map(job => 
            job.id === newJob.id 
              ? { ...job, status: 'processing', progress: Math.round(progress) }
              : job
          )
        )
      }
    }, 500)
  }

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackButton onClick={() => router.back()} />
      
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Download className="h-6 w-6 text-orange-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Export Climate Data</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Download climatological statistics and raw data in various formats
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Point Location</label>
                <Input
                  placeholder="Latitude, Longitude"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Start year"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <Input
                    placeholder="End year"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bounding Box (optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Input
                  placeholder="North"
                  value={bbox.north}
                  onChange={(e) => setBbox({...bbox, north: e.target.value})}
                />
                <Input
                  placeholder="South"
                  value={bbox.south}
                  onChange={(e) => setBbox({...bbox, south: e.target.value})}
                />
                <Input
                  placeholder="East"
                  value={bbox.east}
                  onChange={(e) => setBbox({...bbox, east: e.target.value})}
                />
                <Input
                  placeholder="West"
                  value={bbox.west}
                  onChange={(e) => setBbox({...bbox, west: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Variables to Export</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableVariables.map((variable) => (
                  <div key={variable.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      checked={variables.includes(variable.id)}
                      onCheckedChange={(checked) => handleVariableChange(variable.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium">{variable.label}</label>
                      <p className="text-xs text-gray-500">{variable.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {exportFormats.map((fmt) => {
                  const Icon = fmt.icon
                  return (
                    <div
                      key={fmt.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        format === fmt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormat(fmt.value)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{fmt.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{fmt.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button
              onClick={handleExport}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={variables.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </CardContent>
        </Card>

        {exportJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`} />
                      <div>
                        <div className="font-medium">{job.format.toUpperCase()} Export</div>
                        <div className="text-sm text-gray-500">
                          {job.createdAt.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {job.status === 'processing' && (
                        <div className="text-sm text-gray-500">
                          {job.progress}%
                        </div>
                      )}
                      
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'processing' ? 'secondary' :
                        job.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Available Datasets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Precipitation</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div>• GPM IMERG (2001-2023)</div>
                  <div>• Resolution: 0.1° x 0.1°</div>
                  <div>• Temporal: Daily aggregates</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Temperature & Wind</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div>• MERRA-2 Reanalysis</div>
                  <div>• Resolution: 0.5° x 0.625°</div>
                  <div>• Temporal: Daily means</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

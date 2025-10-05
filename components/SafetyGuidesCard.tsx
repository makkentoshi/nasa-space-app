'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Heart, 
  Activity,
  Building2,
  Waves,
  Flame,
  Droplets,
  Wind,
  Map,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'

interface SafetyGuide {
  id: string
  title: string
  category: string
  file: string
  size: string
  pages?: number
  language: string
  organization: string
  icon: any
  description: string
}

const safetyGuides: SafetyGuide[] = [
  // First Aid
  {
    id: 'red-cross-first-aid',
    title: 'First Aid Basics',
    category: 'First Aid',
    file: '/safety-guides/first-aid/red-cross-first-aid-basics.pdf',
    size: '2 MB',
    pages: 48,
    language: 'en',
    organization: 'Red Cross',
    icon: Heart,
    description: 'CPR, bleeding control, burns, fractures, and shock treatment'
  },
  {
    id: 'ifrc-first-aid',
    title: 'First Aid Training Manual',
    category: 'First Aid',
    file: '/safety-guides/first-aid/ifrc-first-aid-training-manual.pdf',
    size: '8 MB',
    pages: 200,
    language: 'en',
    organization: 'IFRC',
    icon: Heart,
    description: 'Comprehensive first aid training for emergency responders'
  },
  {
    id: 'aha-cpr',
    title: 'CPR Quick Reference',
    category: 'First Aid',
    file: '/safety-guides/first-aid/aha-cpr-quick-reference.pdf',
    size: '500 KB',
    pages: 4,
    language: 'en',
    organization: 'AHA',
    icon: Activity,
    description: 'Adult, child, and infant CPR with AED instructions'
  },

  // Earthquake
  {
    id: 'fema-earthquake',
    title: 'Earthquake Safety Checklist',
    category: 'Earthquake',
    file: '/safety-guides/earthquake/fema-earthquake-safety.pdf',
    size: '500 KB',
    pages: 8,
    language: 'en',
    organization: 'FEMA',
    icon: Building2,
    description: 'Drop-Cover-Hold, preparation, and aftershock safety'
  },
  {
    id: 'red-cross-earthquake',
    title: 'Earthquake Preparedness',
    category: 'Earthquake',
    file: '/safety-guides/earthquake/red-cross-earthquake-preparedness.pdf',
    size: '1 MB',
    pages: 12,
    language: 'en',
    organization: 'Red Cross',
    icon: Building2,
    description: 'Before, during, and after earthquake action steps'
  },

  // Tsunami
  {
    id: 'noaa-tsunami',
    title: 'Tsunami Preparedness Guide',
    category: 'Tsunami',
    file: '/safety-guides/tsunami/noaa-tsunami-preparedness.pdf',
    size: '2 MB',
    pages: 24,
    language: 'en',
    organization: 'NOAA',
    icon: Waves,
    description: 'Tsunami warnings, evacuation routes, and safety zones'
  },

  // Wildfire
  {
    id: 'ready-wildfire',
    title: 'Wildfire Preparedness',
    category: 'Wildfire',
    file: '/safety-guides/wildfire/ready-wildfire-preparedness.pdf',
    size: '1 MB',
    pages: 16,
    language: 'en',
    organization: 'Ready.gov',
    icon: Flame,
    description: 'Defensible space, evacuation planning, and smoke safety'
  },
  {
    id: 'calfire-wildfire',
    title: 'Wildfire Safety Guide',
    category: 'Wildfire',
    file: '/safety-guides/wildfire/calfire-wildfire-safety.pdf',
    size: '3 MB',
    pages: 32,
    language: 'en',
    organization: 'Cal Fire',
    icon: Flame,
    description: 'Home hardening, evacuation checklist, fire prevention'
  },

  // Flood
  {
    id: 'fema-flood',
    title: 'Flood Safety Tips',
    category: 'Flood',
    file: '/safety-guides/flood/fema-flood-safety.pdf',
    size: '500 KB',
    pages: 8,
    language: 'en',
    organization: 'FEMA',
    icon: Droplets,
    description: 'Flood insurance, evacuation, and water safety'
  },
  {
    id: 'red-cross-flood',
    title: 'Flood Preparedness',
    category: 'Flood',
    file: '/safety-guides/flood/red-cross-flood-preparedness.pdf',
    size: '1 MB',
    pages: 12,
    language: 'en',
    organization: 'Red Cross',
    icon: Droplets,
    description: 'Flood alerts, water safety, and home protection'
  },

  // Hurricane
  {
    id: 'fema-hurricane',
    title: 'Hurricane Safety Tips',
    category: 'Hurricane',
    file: '/safety-guides/hurricane/fema-hurricane-safety.pdf',
    size: '500 KB',
    pages: 10,
    language: 'en',
    organization: 'FEMA',
    icon: Wind,
    description: 'Hurricane categories, evacuation, and storm surge'
  },
  {
    id: 'noaa-hurricane',
    title: 'Hurricane Preparedness',
    category: 'Hurricane',
    file: '/safety-guides/hurricane/noaa-hurricane-preparedness.pdf',
    size: '2 MB',
    pages: 20,
    language: 'en',
    organization: 'NOAA',
    icon: Wind,
    description: 'Hurricane tracking, safety zones, and supplies'
  },

  // Emergency Planning
  {
    id: 'fema-family-plan',
    title: 'Family Emergency Plan',
    category: 'Planning',
    file: '/safety-guides/emergency-planning/fema-family-emergency-plan.pdf',
    size: '200 KB',
    pages: 6,
    language: 'en',
    organization: 'FEMA',
    icon: Map,
    description: 'Communication plan, meeting places, important contacts'
  },
  {
    id: 'red-cross-checklist',
    title: 'Emergency Preparedness Checklist',
    category: 'Planning',
    file: '/safety-guides/emergency-planning/red-cross-emergency-checklist.pdf',
    size: '300 KB',
    pages: 8,
    language: 'en',
    organization: 'Red Cross',
    icon: Map,
    description: 'Emergency kit, evacuation plan, family communication'
  },
  {
    id: 'ready-supply-list',
    title: 'Emergency Supply List',
    category: 'Planning',
    file: '/safety-guides/emergency-planning/ready-emergency-supply-list.pdf',
    size: '200 KB',
    pages: 4,
    language: 'en',
    organization: 'Ready.gov',
    icon: Map,
    description: '72-hour kit: water, food, medical supplies, tools'
  },
]

const categoryColors: Record<string, string> = {
  'First Aid': 'bg-red-500/10 text-red-600 border-red-500/20',
  'Earthquake': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Tsunami': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Wildfire': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Flood': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'Hurricane': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Planning': 'bg-green-500/10 text-green-600 border-green-500/20',
}

export function SafetyGuidesCard() {
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())

  const categories = Array.from(new Set(safetyGuides.map(g => g.category)))

  const handleDownload = async (guide: SafetyGuide) => {
    setDownloadingFiles(prev => new Set(prev).add(guide.id))

    try {
      // Check if file exists
      const response = await fetch(guide.file, { method: 'HEAD' })
      
      if (response.ok) {
        // File exists, open in new tab
        window.open(guide.file, '_blank')
        setDownloadedFiles(prev => new Set(prev).add(guide.id))
      } else {
        // File not found
        alert(`⚠️ PDF not found: ${guide.title}\n\nPlease run the download script:\ncd scripts\n.\\download-pdfs.ps1`)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download PDF. Please check if file exists.')
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(guide.id)
        return newSet
      })
    }
  }

  const handleDownloadAll = () => {
    if (confirm('📥 Download all 15 PDF safety guides?\n\nThis will open 15 new tabs. Make sure your browser allows pop-ups.')) {
      safetyGuides.forEach((guide, index) => {
        setTimeout(() => {
          handleDownload(guide)
        }, index * 300) // Stagger downloads by 300ms
      })
    }
  }

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Safety Guides Library</CardTitle>
              <CardDescription>
                International emergency PDF guides from official sources
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleDownloadAll}
            variant="outline"
            className="border-orange-500/30 hover:bg-orange-500/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All (15)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-orange-600">{safetyGuides.length}</div>
            <div className="text-sm text-muted-foreground">Total Guides</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-green-600">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-blue-600">~22 MB</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-purple-600">{downloadedFiles.size}</div>
            <div className="text-sm text-muted-foreground">Downloaded</div>
          </div>
        </div>

        {/* Download Script Info */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Download PDFs First</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Run the PowerShell script to download all PDF files:
              </p>
              <code className="block mt-2 p-2 rounded bg-blue-100 dark:bg-blue-900/50 text-sm font-mono">
                cd scripts<br />
                .\download-pdfs.ps1
              </code>
              <a 
                href="/scripts/README.md" 
                target="_blank"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Script Documentation <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Guides by Category */}
        {categories.map(category => {
          const categoryGuides = safetyGuides.filter(g => g.category === category)
          const Icon = categoryGuides[0]?.icon || FileText

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{category}</h3>
                <Badge variant="outline" className={categoryColors[category]}>
                  {categoryGuides.length} {categoryGuides.length === 1 ? 'guide' : 'guides'}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {categoryGuides.map(guide => {
                  const isDownloaded = downloadedFiles.has(guide.id)
                  const isDownloading = downloadingFiles.has(guide.id)

                  return (
                    <div
                      key={guide.id}
                      className="p-4 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{guide.title}</h4>
                            {isDownloaded && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {guide.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {guide.organization}
                            </Badge>
                            <span>•</span>
                            <span>{guide.size}</span>
                            {guide.pages && (
                              <>
                                <span>•</span>
                                <span>{guide.pages} pages</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isDownloaded ? "outline" : "default"}
                          onClick={() => handleDownload(guide)}
                          disabled={isDownloading}
                          className="flex-shrink-0"
                        >
                          {isDownloading ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : isDownloaded ? (
                            <>
                              <ExternalLink className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Attribution */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Emergency guides provided by FEMA, Red Cross, IFRC, WHO, NOAA, Ready.gov, and Cal Fire
        </div>
      </CardContent>
    </Card>
  )
}

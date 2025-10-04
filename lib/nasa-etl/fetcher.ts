/**
 * NASA Data Fetcher
 * Handles data retrieval from various NASA Earth Science APIs
 */

import { DatasetConfig, ETLConfig } from './config'

export interface FetchRequest {
  dataset: string
  variables: string[]
  spatial: {
    lat?: number
    lon?: number
    bounds?: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  temporal: {
    start: string
    end: string
  }
  format?: 'json' | 'csv' | 'netcdf'
}

export interface FetchResponse {
  success: boolean
  data: any
  metadata: {
    dataset: string
    variables: string[]
    spatial_coverage: any
    temporal_coverage: {
      start: string
      end: string
    }
    fetch_time: string
    source_urls: string[]
  }
  warnings?: string[]
  error?: string
}

class RateLimiter {
  private requests: number[] = []
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(requestsPerMinute: number) {
    this.maxRequests = requestsPerMinute
    this.windowMs = 60000 // 1 minute
  }

  async acquire(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.windowMs - (now - oldestRequest)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return this.acquire()
    }

    this.requests.push(now)
  }
}

export class NASADataFetcher {
  private config: ETLConfig
  private authTokens: Map<string, string> = new Map()
  private rateLimiters: Map<string, RateLimiter> = new Map()

  constructor(config: ETLConfig) {
    this.config = config
    this.initializeRateLimiters()
  }

  private initializeRateLimiters() {
    Object.entries(this.config.datasets).forEach(([key, dataset]) => {
      this.rateLimiters.set(key, new RateLimiter(dataset.rate_limits.requests_per_minute))
    })
  }

  async authenticateEarthdata(username: string, password: string): Promise<boolean> {
    try {
      // Mock authentication - in real implementation would connect to NASA Earthdata
      console.log('Authenticating with NASA Earthdata Login...')
      this.authTokens.set('earthdata', 'mock-token-' + Date.now())
      return true
    } catch (error) {
      console.error('Earthdata authentication failed:', error)
      return false
    }
  }

  async fetchData(request: FetchRequest): Promise<FetchResponse> {
    const dataset = this.config.datasets[request.dataset]
    if (!dataset) {
      return {
        success: false,
        data: null,
        metadata: {
          dataset: request.dataset,
          variables: request.variables,
          spatial_coverage: request.spatial,
          temporal_coverage: request.temporal,
          fetch_time: new Date().toISOString(),
          source_urls: []
        },
        error: `Dataset not found: ${request.dataset}`
      }
    }

    // Rate limiting
    const rateLimiter = this.rateLimiters.get(request.dataset)
    if (rateLimiter) {
      await rateLimiter.acquire()
    }

    console.log(`Fetching data from ${dataset.name}...`)

    try {
      switch (request.dataset) {
        case 'nasa_power':
          return await this.fetchNASAPower(request, dataset)
        case 'eonet':
          return await this.fetchEONET(request, dataset)
        default:
          return this.generateMockResponse(request, dataset)
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        metadata: {
          dataset: request.dataset,
          variables: request.variables,
          spatial_coverage: request.spatial,
          temporal_coverage: request.temporal,
          fetch_time: new Date().toISOString(),
          source_urls: []
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async fetchNASAPower(request: FetchRequest, dataset: DatasetConfig): Promise<FetchResponse> {
    const { lat, lon } = request.spatial
    if (lat === undefined || lon === undefined) {
      throw new Error('NASA POWER requires lat/lon coordinates')
    }

    const startDate = request.temporal.start.replace(/-/g, '')
    const endDate = request.temporal.end.replace(/-/g, '')
    const parameters = request.variables.join(',')

    const url = `${dataset.baseUrl}/daily/point?parameters=${parameters}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`

    console.log(`Fetching from NASA POWER API: ${url}`)

    // Mock response for NASA POWER
    const mockData = this.generateMockPowerData(request)

    return {
      success: true,
      data: mockData,
      metadata: {
        dataset: request.dataset,
        variables: request.variables,
        spatial_coverage: { lat, lon },
        temporal_coverage: request.temporal,
        fetch_time: new Date().toISOString(),
        source_urls: [url]
      }
    }
  }

  private async fetchEONET(request: FetchRequest, dataset: DatasetConfig): Promise<FetchResponse> {
    const start = request.temporal.start
    const end = request.temporal.end
    const url = `${dataset.baseUrl}/events?start=${start}&end=${end}&status=all`

    console.log(`Fetching from EONET API: ${url}`)

    // Mock response for EONET
    const mockEvents = {
      events: [
        {
          id: 'EONET_123',
          title: 'Severe Weather Event',
          description: 'High winds and heavy precipitation',
          categories: [{ id: 'severeStorms', title: 'Severe Storms' }],
          geometry: [
            {
              date: start,
              type: 'Point',
              coordinates: [request.spatial.lon || 0, request.spatial.lat || 0]
            }
          ]
        }
      ]
    }

    return {
      success: true,
      data: mockEvents,
      metadata: {
        dataset: request.dataset,
        variables: request.variables,
        spatial_coverage: request.spatial,
        temporal_coverage: request.temporal,
        fetch_time: new Date().toISOString(),
        source_urls: [url]
      }
    }
  }

  private generateMockPowerData(request: FetchRequest): any {
    const startDate = new Date(request.temporal.start)
    const endDate = new Date(request.temporal.end)
    const data: any = {
      properties: {
        parameter: {}
      }
    }

    request.variables.forEach(variable => {
      const values: any = {}
      let currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0].replace(/-/g, '')
        // Generate realistic-looking data based on variable type
        let value = 0
        switch (variable) {
          case 'T2M':
            value = 15 + Math.random() * 15 // 15-30°C
            break
          case 'RH2M':
            value = 40 + Math.random() * 40 // 40-80%
            break
          case 'PRECTOTCORR':
            value = Math.random() * 10 // 0-10mm
            break
          case 'WS10M':
            value = 2 + Math.random() * 8 // 2-10 m/s
            break
          default:
            value = Math.random() * 100
        }
        values[dateKey] = Math.round(value * 100) / 100
        currentDate.setDate(currentDate.getDate() + 1)
      }

      data.properties.parameter[variable] = values
    })

    return data
  }

  private generateMockResponse(request: FetchRequest, dataset: DatasetConfig): FetchResponse {
    console.log(`Generating mock response for ${dataset.name}`)
    
    return {
      success: true,
      data: { message: 'Mock data - implementation pending' },
      metadata: {
        dataset: request.dataset,
        variables: request.variables,
        spatial_coverage: request.spatial,
        temporal_coverage: request.temporal,
        fetch_time: new Date().toISOString(),
        source_urls: [dataset.baseUrl]
      },
      warnings: ['Using mock data - actual API integration pending']
    }
  }
}

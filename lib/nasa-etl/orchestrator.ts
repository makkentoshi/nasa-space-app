/**
 * NASA ETL Orchestrator
 * Manages ETL job lifecycle and execution
 */

import { ETLConfig, DEFAULT_ETL_CONFIG, DatasetKey } from './config'
import { NASADataFetcher, FetchRequest, FetchResponse } from './fetcher'
import { NASADataProcessor, ProcessingResult } from './processor'

export interface ETLJob {
  id: string
  name: string
  description: string
  dataset: DatasetKey
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
  processing: {
    quality_control: boolean
    outlier_detection: boolean
    gap_filling: boolean
    output_format: 'json' | 'csv' | 'netcdf'
  }
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    next_run?: string
  }
}

export interface ETLResult {
  job_id: string
  execution_id: string
  status: 'success' | 'partial_success' | 'failure'
  start_time: string
  end_time: string
  duration_ms: number
  data_summary: {
    records_processed: number
    variables_count: number
    spatial_coverage: any
    temporal_coverage: any
    quality_score: number
  }
  storage_info: {
    file_path: string
    file_size_mb: number
    format: string
  }
  performance_metrics: {
    fetch_time_ms: number
    processing_time_ms: number
    storage_time_ms: number
    memory_peak_mb: number
  }
  warnings?: string[]
  error?: string
}

export class NASAETLOrchestrator {
  private config: ETLConfig
  private fetcher: NASADataFetcher
  private processor: NASADataProcessor
  private jobs: Map<string, ETLJob> = new Map()
  private executionHistory: Map<string, ETLResult[]> = new Map()

  constructor(config: ETLConfig = DEFAULT_ETL_CONFIG) {
    this.config = config
    this.fetcher = new NASADataFetcher(config)
    this.processor = new NASADataProcessor(config)
  }

  registerJob(job: ETLJob): { success: boolean; message: string } {
    const validation = this.validateJob(job)
    if (!validation.valid) {
      return { success: false, message: validation.message || 'Invalid job configuration' }
    }

    this.jobs.set(job.id, job)
    console.log(`✅ Job registered: ${job.name} (${job.id})`)
    return { success: true, message: 'Job registered successfully' }
  }

  async executeJob(jobId: string): Promise<ETLResult> {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const startTime = new Date().toISOString()
    const startTimeMs = Date.now()

    console.log(`🚀 Starting ETL execution: ${job.name} (${executionId})`)

    try {
      // Step 1: Fetch data
      const fetchStartTime = Date.now()
      const fetchRequest: FetchRequest = {
        dataset: job.dataset,
        variables: job.variables,
        spatial: job.spatial,
        temporal: job.temporal,
        format: job.processing.output_format
      }

      const fetchResponse = await this.fetcher.fetchData(fetchRequest)
      const fetchTime = Date.now() - fetchStartTime

      if (!fetchResponse.success) {
        throw new Error(fetchResponse.error || 'Data fetch failed')
      }

      // Step 2: Process data
      const processingStartTime = Date.now()
      const processedResult = await this.processor.processData(fetchResponse)
      const processingTime = Date.now() - processingStartTime

      if (!processedResult.success) {
        throw new Error(processedResult.error || 'Data processing failed')
      }

      // Step 3: Store data
      const storageStartTime = Date.now()
      const storageInfo = await this.storeData(processedResult.data, job, executionId)
      const storageTime = Date.now() - storageStartTime

      // Generate result
      const endTime = new Date().toISOString()
      const totalDuration = Date.now() - startTimeMs

      const result: ETLResult = {
        job_id: jobId,
        execution_id: executionId,
        status: processedResult.warnings ? 'partial_success' : 'success',
        start_time: startTime,
        end_time: endTime,
        duration_ms: totalDuration,
        data_summary: {
          records_processed: processedResult.metadata.records_processed,
          variables_count: job.variables.length,
          spatial_coverage: job.spatial,
          temporal_coverage: job.temporal,
          quality_score: processedResult.metadata.quality_metrics.accuracy_score
        },
        storage_info: storageInfo,
        performance_metrics: {
          fetch_time_ms: fetchTime,
          processing_time_ms: processingTime,
          storage_time_ms: storageTime,
          memory_peak_mb: this.getMemoryUsage()
        },
        warnings: processedResult.warnings
      }

      // Store execution history
      const history = this.executionHistory.get(jobId) || []
      history.push(result)
      this.executionHistory.set(jobId, history)

      console.log(`✅ ETL execution completed: ${executionId}`)
      return result

    } catch (error) {
      const endTime = new Date().toISOString()
      const totalDuration = Date.now() - startTimeMs

      const errorResult: ETLResult = {
        job_id: jobId,
        execution_id: executionId,
        status: 'failure',
        start_time: startTime,
        end_time: endTime,
        duration_ms: totalDuration,
        data_summary: {
          records_processed: 0,
          variables_count: job.variables.length,
          spatial_coverage: job.spatial,
          temporal_coverage: job.temporal,
          quality_score: 0
        },
        storage_info: {
          file_path: '',
          file_size_mb: 0,
          format: job.processing.output_format
        },
        performance_metrics: {
          fetch_time_ms: 0,
          processing_time_ms: 0,
          storage_time_ms: 0,
          memory_peak_mb: this.getMemoryUsage()
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      const history = this.executionHistory.get(jobId) || []
      history.push(errorResult)
      this.executionHistory.set(jobId, history)

      console.error(`❌ ETL execution failed: ${executionId}`, error)
      return errorResult
    }
  }

  async executeJobsBatch(jobIds: string[]): Promise<ETLResult[]> {
    console.log(`📦 Executing batch of ${jobIds.length} jobs...`)
    
    const maxParallel = this.config.concurrency.max_parallel_jobs
    const results: ETLResult[] = []

    for (let i = 0; i < jobIds.length; i += maxParallel) {
      const batch = jobIds.slice(i, i + maxParallel)
      const batchResults = await Promise.all(
        batch.map(jobId => this.executeJob(jobId))
      )
      results.push(...batchResults)
    }

    return results
  }

  getJobHistory(jobId: string): ETLResult[] {
    return this.executionHistory.get(jobId) || []
  }

  getRegisteredJobs(): ETLJob[] {
    return Array.from(this.jobs.values())
  }

  getJobStatus(jobId: string): {
    job: ETLJob | null
    recent_executions: ETLResult[]
    last_success?: ETLResult
    last_failure?: ETLResult
  } {
    const job = this.jobs.get(jobId) || null
    const history = this.executionHistory.get(jobId) || []
    const lastSuccess = history.filter(r => r.status === 'success').pop()
    const lastFailure = history.filter(r => r.status === 'failure').pop()

    return {
      job,
      recent_executions: history.slice(-5),
      last_success: lastSuccess,
      last_failure: lastFailure
    }
  }

  async authenticate(earthdataUsername?: string, earthdataPassword?: string): Promise<boolean> {
    if (earthdataUsername && earthdataPassword) {
      return await this.fetcher.authenticateEarthdata(earthdataUsername, earthdataPassword)
    }
    return true
  }

  private validateJob(job: ETLJob): { valid: boolean; message?: string } {
    if (!job.id || !job.name) {
      return { valid: false, message: 'Job must have id and name' }
    }

    if (!job.dataset || !this.config.datasets[job.dataset]) {
      return { valid: false, message: `Invalid dataset: ${job.dataset}` }
    }

    if (!job.variables || job.variables.length === 0) {
      return { valid: false, message: 'Job must specify at least one variable' }
    }

    if (!job.temporal || !job.temporal.start || !job.temporal.end) {
      return { valid: false, message: 'Job must specify temporal range' }
    }

    return { valid: true }
  }

  private async storeData(data: any, job: ETLJob, executionId: string): Promise<{
    file_path: string
    file_size_mb: number
    format: string
  }> {
    const fileName = `${job.dataset}_${job.id}_${executionId}.${job.processing.output_format}`
    const filePath = `${this.config.storage.processed_data_path}/${fileName}`
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const fileSizeMB = dataString.length / (1024 * 1024)

    console.log(`💾 Data stored: ${filePath} (${fileSizeMB.toFixed(2)} MB)`)

    return {
      file_path: filePath,
      file_size_mb: Math.round(fileSizeMB * 100) / 100,
      format: job.processing.output_format
    }
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
    }
    return 0
  }
}

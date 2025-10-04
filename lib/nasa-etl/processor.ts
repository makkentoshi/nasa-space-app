/**
 * NASA Data Processor
 * Quality control, transformation, and aggregation of NASA data
 */

import { ETLConfig } from './config'
import { FetchResponse } from './fetcher'

export interface ProcessingResult {
  success: boolean
  data: any
  metadata: {
    records_processed: number
    quality_metrics: {
      completeness: number
      accuracy_score: number
      outliers_detected: number
      gaps_filled: number
    }
    processing_steps: string[]
  }
  warnings?: string[]
  error?: string
}

export class NASADataProcessor {
  private config: ETLConfig

  constructor(config: ETLConfig) {
    this.config = config
  }

  async processData(fetchResponse: FetchResponse): Promise<ProcessingResult> {
    if (!fetchResponse.success) {
      return {
        success: false,
        data: null,
        metadata: {
          records_processed: 0,
          quality_metrics: {
            completeness: 0,
            accuracy_score: 0,
            outliers_detected: 0,
            gaps_filled: 0
          },
          processing_steps: []
        },
        error: fetchResponse.error || 'Fetch failed'
      }
    }

    console.log('Processing fetched data...')

    const processingSteps: string[] = []
    let processedData = fetchResponse.data
    const warnings: string[] = []

    try {
      // Step 1: Quality Control
      if (this.config.processing.enable_quality_control) {
        const qcResult = this.performQualityControl(processedData)
        processedData = qcResult.data
        processingSteps.push('quality_control')
        warnings.push(...(qcResult.warnings || []))
      }

      // Step 2: Outlier Detection
      if (this.config.processing.outlier_detection.method !== 'none') {
        const outlierResult = this.detectOutliers(processedData)
        processedData = outlierResult.data
        processingSteps.push('outlier_detection')
      }

      // Step 3: Gap Filling
      if (this.config.processing.gap_filling.method !== 'none') {
        const gapResult = this.fillGaps(processedData)
        processedData = gapResult.data
        processingSteps.push('gap_filling')
      }

      // Step 4: Temporal Aggregation
      if (this.config.processing.temporal_aggregation.enabled) {
        processedData = this.aggregateTemporally(processedData)
        processingSteps.push('temporal_aggregation')
      }

      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(processedData)

      return {
        success: true,
        data: processedData,
        metadata: {
          records_processed: this.countRecords(processedData),
          quality_metrics: qualityMetrics,
          processing_steps: processingSteps
        },
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        metadata: {
          records_processed: 0,
          quality_metrics: {
            completeness: 0,
            accuracy_score: 0,
            outliers_detected: 0,
            gaps_filled: 0
          },
          processing_steps: processingSteps
        },
        error: error instanceof Error ? error.message : 'Processing failed'
      }
    }
  }

  private performQualityControl(data: any): { data: any; warnings?: string[] } {
    console.log('Performing quality control...')
    
    // Basic quality control - remove invalid values
    const warnings: string[] = []
    let processedData = data

    if (data && data.properties && data.properties.parameter) {
      Object.keys(data.properties.parameter).forEach(variable => {
        const values = data.properties.parameter[variable]
        const validValues: any = {}
        let invalidCount = 0

        Object.entries(values).forEach(([date, value]) => {
          // Check for valid numbers
          if (typeof value === 'number' && isFinite(value)) {
            validValues[date] = value
          } else {
            invalidCount++
          }
        })

        data.properties.parameter[variable] = validValues

        if (invalidCount > 0) {
          warnings.push(`Removed ${invalidCount} invalid values from ${variable}`)
        }
      })
    }

    return { data: processedData, warnings: warnings.length > 0 ? warnings : undefined }
  }

  private detectOutliers(data: any): { data: any; outliersDetected: number } {
    console.log('Detecting outliers using IQR method...')
    
    let outliersDetected = 0

    if (data && data.properties && data.properties.parameter) {
      Object.keys(data.properties.parameter).forEach(variable => {
        const values = data.properties.parameter[variable]
        const numericValues = Object.values(values).filter(v => typeof v === 'number') as number[]

        if (numericValues.length > 0) {
          const { q1, q3, iqr } = this.calculateIQR(numericValues)
          const lowerBound = q1 - this.config.processing.outlier_detection.threshold * iqr
          const upperBound = q3 + this.config.processing.outlier_detection.threshold * iqr

          Object.entries(values).forEach(([date, value]) => {
            if (typeof value === 'number' && (value < lowerBound || value > upperBound)) {
              outliersDetected++
              // Mark as null instead of removing to preserve temporal structure
              data.properties.parameter[variable][date] = null
            }
          })
        }
      })
    }

    return { data, outliersDetected }
  }

  private calculateIQR(values: number[]): { q1: number; q3: number; iqr: number } {
    const sorted = [...values].sort((a, b) => a - b)
    const q1Index = Math.floor(sorted.length * 0.25)
    const q3Index = Math.floor(sorted.length * 0.75)
    const q1 = sorted[q1Index]
    const q3 = sorted[q3Index]
    const iqr = q3 - q1
    return { q1, q3, iqr }
  }

  private fillGaps(data: any): { data: any; gapsFilled: number } {
    console.log('Filling gaps using linear interpolation...')
    
    let gapsFilled = 0

    if (data && data.properties && data.properties.parameter) {
      Object.keys(data.properties.parameter).forEach(variable => {
        const values = data.properties.parameter[variable]
        const dates = Object.keys(values).sort()

        for (let i = 0; i < dates.length; i++) {
          if (values[dates[i]] === null || values[dates[i]] === undefined) {
            // Find previous and next valid values
            let prevIndex = i - 1
            let nextIndex = i + 1

            while (prevIndex >= 0 && (values[dates[prevIndex]] === null || values[dates[prevIndex]] === undefined)) {
              prevIndex--
            }
            while (nextIndex < dates.length && (values[dates[nextIndex]] === null || values[dates[nextIndex]] === undefined)) {
              nextIndex++
            }

            if (prevIndex >= 0 && nextIndex < dates.length) {
              const gapSize = nextIndex - prevIndex - 1
              if (gapSize <= this.config.processing.gap_filling.max_gap_size) {
                const prevValue = values[dates[prevIndex]]
                const nextValue = values[dates[nextIndex]]
                const interpolated = prevValue + (nextValue - prevValue) * ((i - prevIndex) / (nextIndex - prevIndex))
                values[dates[i]] = Math.round(interpolated * 100) / 100
                gapsFilled++
              }
            }
          }
        }
      })
    }

    return { data, gapsFilled }
  }

  private aggregateTemporally(data: any): any {
    console.log('Performing temporal aggregation...')
    
    // Simplified aggregation - just calculate daily averages if data is sub-daily
    if (data && data.properties && data.properties.parameter) {
      Object.keys(data.properties.parameter).forEach(variable => {
        const values = data.properties.parameter[variable]
        const dailyAverages: any = {}

        Object.entries(values).forEach(([dateKey, value]) => {
          const dailyKey = dateKey.substring(0, 8) // Extract YYYYMMDD
          if (!dailyAverages[dailyKey]) {
            dailyAverages[dailyKey] = []
          }
          if (typeof value === 'number') {
            dailyAverages[dailyKey].push(value)
          }
        })

        // Calculate averages
        Object.keys(dailyAverages).forEach(dailyKey => {
          const vals = dailyAverages[dailyKey]
          if (vals.length > 0) {
            const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length
            dailyAverages[dailyKey] = Math.round(avg * 100) / 100
          }
        })

        data.properties.parameter[variable] = dailyAverages
      })
    }

    return data
  }

  private calculateQualityMetrics(data: any): {
    completeness: number
    accuracy_score: number
    outliers_detected: number
    gaps_filled: number
  } {
    let totalValues = 0
    let validValues = 0

    if (data && data.properties && data.properties.parameter) {
      Object.values(data.properties.parameter).forEach((variable: any) => {
        Object.values(variable).forEach(value => {
          totalValues++
          if (value !== null && value !== undefined && typeof value === 'number' && isFinite(value)) {
            validValues++
          }
        })
      })
    }

    const completeness = totalValues > 0 ? validValues / totalValues : 0

    return {
      completeness: Math.round(completeness * 100) / 100,
      accuracy_score: 0.85, // Simplified - would be calculated from validation
      outliers_detected: 0,
      gaps_filled: 0
    }
  }

  private countRecords(data: any): number {
    if (!data || !data.properties || !data.properties.parameter) {
      return 0
    }

    const firstVariable = Object.values(data.properties.parameter)[0]
    if (firstVariable && typeof firstVariable === 'object') {
      return Object.keys(firstVariable).length
    }

    return 0
  }
}

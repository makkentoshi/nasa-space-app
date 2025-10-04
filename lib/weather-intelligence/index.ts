/**
 * Integrated RAG + GPT Weather Intelligence System
 * 
 * Combines the RAG system with GPT-5 integration to provide
 * comprehensive, context-aware weather recommendations.
 */

import { RAGSystem, RAGSystemConfig, WeatherRecommendationRequest } from '../rag-system'
import { WeatherGPTService, createWeatherGPTService, GPTRequest, GPTResponse } from '../gpt-integration'

export interface WeatherIntelligenceConfig {
  rag_system: RAGSystemConfig
  gpt_service: {
    api_key: string
    model?: string
    temperature?: number
    max_tokens?: number
  }
  integration_settings?: {
    use_rag_context: boolean
    context_length_limit: number
    fallback_to_rag_only: boolean
    cache_responses: boolean
    response_validation: boolean
  }
}

export interface EnhancedWeatherRecommendation {
  // Core recommendation
  recommendation: string
  confidence: number
  
  // Risk assessment
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high'
    specific_risks: string[]
    risk_likelihood: Record<string, string>
    severity_if_occurs: Record<string, string>
    mitigation_strategies: string[]
  }
  
  // Actionable guidance
  actionable_advice: string[]
  timing_recommendations: {
    optimal_windows: string[]
    avoid_windows: string[]
    monitoring_points: string[]
  }
  contingency_options: string[]
  alternative_scenarios: string[]
  
  // Data and sources
  data_sources: string[]
  rag_context_used: string
  gpt_reasoning: string
  knowledge_base_stats: {
    documents_consulted: number
    average_relevance: number
    search_time_ms: number
  }
  
  // Model information
  model_info: {
    rag_provider: string
    gpt_model: string
    processing_time_ms: number
    tokens_used: number
  }
  
  // Follow-up
  follow_up_questions: string[]
  related_queries: string[]
}

/**
 * Weather Data Formatter for GPT Integration
 */
export class WeatherDataFormatter {
  
  static formatCurrentWeather(data: any): any {
    if (!data) return null
    
    return {
      temperature: data.temperature || data.temp,
      feels_like: data.feels_like || data.apparent_temperature,
      humidity: data.humidity,
      wind_speed: data.wind_speed || data.windSpeed,
      wind_direction: data.wind_direction || data.windDirection,
      pressure: data.pressure || data.atmospheric_pressure,
      visibility: data.visibility,
      conditions: data.conditions || data.weather_conditions || [],
      precipitation_rate: data.precipitation_rate,
      uv_index: data.uv_index,
      cloud_cover: data.cloud_cover
    }
  }

  static formatForecastData(data: any): any {
    if (!data) return null
    
    // Handle both array and object formats
    if (Array.isArray(data)) {
      return data.slice(0, 5).map(item => this.formatCurrentWeather(item)) // Next 5 periods
    }
    
    return this.formatCurrentWeather(data)
  }

  static formatNASAData(data: any): any {
    if (!data) return null
    
    return {
      precipitation_analysis: data.precipitation || data.gpm_imerg,
      atmospheric_data: data.atmospheric || data.merra2,
      solar_radiation: data.solar || data.power,
      satellite_imagery: data.satellite || data.modis,
      climate_models: data.climate || data.giss
    }
  }
}

/**
 * Response Validator
 */
export class ResponseValidator {
  
  static validateRecommendation(recommendation: EnhancedWeatherRecommendation): {
    valid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []
    
    // Check required fields
    if (!recommendation.recommendation || recommendation.recommendation.length < 10) {
      errors.push('Recommendation text is too short or missing')
    }
    
    if (recommendation.confidence < 0 || recommendation.confidence > 1) {
      errors.push('Confidence score must be between 0 and 1')
    }
    
    // Check risk assessment
    if (!recommendation.risk_assessment?.overall_risk) {
      errors.push('Overall risk assessment is missing')
    }
    
    if (!recommendation.actionable_advice?.length) {
      warnings.push('No actionable advice provided')
    }
    
    // Check timing recommendations
    if (!recommendation.timing_recommendations?.optimal_windows?.length &&
        !recommendation.timing_recommendations?.avoid_windows?.length) {
      warnings.push('No timing recommendations provided')
    }
    
    // Check data sources
    if (!recommendation.data_sources?.length) {
      warnings.push('No data sources referenced')
    }
    
    return {
      valid: errors.length === 0,
      warnings,
      errors
    }
  }

  static sanitizeRecommendation(recommendation: EnhancedWeatherRecommendation): EnhancedWeatherRecommendation {
    // Ensure arrays are not null/undefined
    return {
      ...recommendation,
      risk_assessment: {
        ...recommendation.risk_assessment,
        specific_risks: recommendation.risk_assessment?.specific_risks || [],
        mitigation_strategies: recommendation.risk_assessment?.mitigation_strategies || []
      },
      actionable_advice: recommendation.actionable_advice || [],
      timing_recommendations: {
        optimal_windows: recommendation.timing_recommendations?.optimal_windows || [],
        avoid_windows: recommendation.timing_recommendations?.avoid_windows || [],
        monitoring_points: recommendation.timing_recommendations?.monitoring_points || []
      },
      contingency_options: recommendation.contingency_options || [],
      alternative_scenarios: recommendation.alternative_scenarios || [],
      data_sources: recommendation.data_sources || [],
      follow_up_questions: recommendation.follow_up_questions || [],
      related_queries: recommendation.related_queries || []
    }
  }
}

/**
 * Main Weather Intelligence System
 */
export class WeatherIntelligenceSystem {
  private ragSystem: RAGSystem
  private gptService: WeatherGPTService
  private config: WeatherIntelligenceConfig
  private responseCache: Map<string, EnhancedWeatherRecommendation> = new Map()
  private initialized = false

  constructor(config: WeatherIntelligenceConfig) {
    this.config = config
    this.ragSystem = new RAGSystem(config.rag_system)
    this.gptService = createWeatherGPTService(
      config.gpt_service.api_key,
      {
        model: config.gpt_service.model,
        temperature: config.gpt_service.temperature,
        max_tokens: config.gpt_service.max_tokens
      }
    )
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Weather Intelligence System already initialized')
      return
    }

    console.log('🌤️ Initializing Weather Intelligence System...')

    try {
      // Initialize RAG system
      console.log('Initializing RAG system...')
      await this.ragSystem.initialize()
      
      // Load default knowledge base
      console.log('Loading weather knowledge base...')
      await this.ragSystem.loadDefaultKnowledge()
      
      // Test GPT connection
      console.log('Testing GPT service connection...')
      const gptConnected = await this.gptService.testConnection()
      if (!gptConnected) {
        throw new Error('Failed to connect to GPT service')
      }
      
      this.initialized = true
      console.log('✅ Weather Intelligence System initialization complete')
      
    } catch (error) {
      console.error('❌ Weather Intelligence System initialization failed:', error)
      throw error
    }
  }

  async getWeatherRecommendation(request: WeatherRecommendationRequest): Promise<EnhancedWeatherRecommendation> {
    if (!this.initialized) {
      throw new Error('Weather Intelligence System not initialized')
    }

    const startTime = Date.now()
    
    console.log(`🧠 Generating intelligent weather recommendation for: "${request.user_query}"`)

    try {
      // Check cache first if enabled
      if (this.config.integration_settings?.cache_responses) {
        const cacheKey = this.generateCacheKey(request)
        if (this.responseCache.has(cacheKey)) {
          console.log('📋 Returning cached recommendation')
          return this.responseCache.get(cacheKey)!
        }
      }

      // Step 1: Get RAG system recommendation
      console.log('🔍 Retrieving relevant knowledge from RAG system...')
      const ragRecommendation = await this.ragSystem.getRecommendation(request)
      
      // Step 2: Prepare GPT request with RAG context
      console.log('🤖 Generating enhanced recommendation with GPT...')
      const gptRequest = this.buildGPTRequest(request, ragRecommendation)
      
      // Step 3: Get GPT enhancement
      const gptResponse = await this.gptService.generateRecommendation(gptRequest)
      
      // Step 4: Merge and enhance the recommendations
      const enhancedRecommendation = this.mergeRecommendations(
        ragRecommendation,
        gptResponse,
        startTime
      )
      
      // Step 5: Validate response if enabled
      if (this.config.integration_settings?.response_validation) {
        const validation = ResponseValidator.validateRecommendation(enhancedRecommendation)
        if (!validation.valid) {
          console.warn('⚠️ Generated recommendation has validation errors:', validation.errors)
          // Still return the recommendation but log issues
        }
        if (validation.warnings.length > 0) {
          console.warn('⚠️ Generated recommendation has warnings:', validation.warnings)
        }
      }
      
      // Step 6: Sanitize and cache response
      const sanitizedRecommendation = ResponseValidator.sanitizeRecommendation(enhancedRecommendation)
      
      if (this.config.integration_settings?.cache_responses) {
        const cacheKey = this.generateCacheKey(request)
        this.responseCache.set(cacheKey, sanitizedRecommendation)
      }
      
      const totalTime = Date.now() - startTime
      console.log(`✅ Intelligent weather recommendation generated in ${totalTime}ms`)
      
      return sanitizedRecommendation
      
    } catch (error) {
      console.error('❌ Failed to generate weather recommendation:', error)
      
      // Fallback to RAG-only if configured
      if (this.config.integration_settings?.fallback_to_rag_only) {
        console.log('🔄 Falling back to RAG-only recommendation...')
        return this.generateRAGOnlyRecommendation(request, startTime)
      }
      
      throw error
    }
  }

  private buildGPTRequest(
    request: WeatherRecommendationRequest,
    ragRecommendation: any
  ): GPTRequest {
    // Format weather data for GPT
    const formattedWeather = {
      current: WeatherDataFormatter.formatCurrentWeather(request.current_weather),
      forecast: WeatherDataFormatter.formatForecastData(null), // Would come from forecast API
      nasa_data: WeatherDataFormatter.formatNASAData(null) // Would come from NASA ETL
    }
    
    // Prepare context with length limit
    const contextLimit = this.config.integration_settings?.context_length_limit || 4000
    const truncatedContext = ragRecommendation.context_used.length > contextLimit
      ? ragRecommendation.context_used.substring(0, contextLimit) + '...'
      : ragRecommendation.context_used
    
    return {
      query: request.user_query,
      context: truncatedContext,
      location: request.location ? {
        name: request.location.name || 'Unknown location',
        latitude: request.location.latitude,
        longitude: request.location.longitude
      } : undefined,
      weather_data: formattedWeather,
      event_context: request.event_context,
      user_preferences: request.user_preferences ? {
        risk_tolerance: request.user_preferences.risk_tolerance || 'medium',
        communication_style: 'detailed',
        focus_areas: request.user_preferences.activity_types || []
      } : undefined
    }
  }

  private mergeRecommendations(
    ragRecommendation: any,
    gptResponse: GPTResponse,
    startTime: number
  ): EnhancedWeatherRecommendation {
    // Parse GPT response if it's a structured recommendation
    let gptParsed: any = {}
    
    try {
      // Try to extract structured data from GPT response
      if (typeof gptResponse.reasoning === 'string' && gptResponse.reasoning.includes('{')) {
        const jsonMatch = gptResponse.reasoning.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          gptParsed = JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.warn('Could not parse structured GPT response, using raw text')
    }
    
    const processingTime = Date.now() - startTime
    
    return {
      // Use GPT recommendation as primary, fallback to RAG
      recommendation: gptResponse.recommendation || ragRecommendation.recommendation,
      confidence: gptResponse.confidence || 0.7,
      
      // Enhanced risk assessment combining both sources
      risk_assessment: {
        overall_risk: gptParsed.risk_assessment?.overall_risk || ragRecommendation.risk_assessment?.overall_risk || 'medium',
        specific_risks: [
          ...(gptParsed.risk_assessment?.specific_risks || []),
          ...(ragRecommendation.risk_assessment?.specific_risks || [])
        ].slice(0, 5), // Limit to top 5
        risk_likelihood: gptParsed.risk_assessment?.risk_likelihood || {},
        severity_if_occurs: gptParsed.risk_assessment?.severity_if_occurs || {},
        mitigation_strategies: [
          ...(gptParsed.risk_assessment?.mitigation_strategies || []),
          ...(ragRecommendation.risk_assessment?.mitigation_strategies || [])
        ].slice(0, 5)
      },
      
      // Actionable guidance
      actionable_advice: [
        ...(gptParsed.actionable_advice || []),
        ...(ragRecommendation.actionable_advice || [])
      ].slice(0, 7), // Limit to top 7
      
      timing_recommendations: {
        optimal_windows: gptParsed.timing_recommendations?.optimal_windows || [],
        avoid_windows: gptParsed.timing_recommendations?.avoid_windows || [],
        monitoring_points: gptParsed.timing_recommendations?.monitoring_points || []
      },
      
      contingency_options: [
        ...(gptParsed.contingency_options || []),
        ...(ragRecommendation.alternative_options || [])
      ].slice(0, 5),
      
      alternative_scenarios: gptResponse.alternative_scenarios || [],
      
      // Data and sources
      data_sources: ragRecommendation.data_sources || [],
      rag_context_used: ragRecommendation.context_used || '',
      gpt_reasoning: gptResponse.reasoning || '',
      
      knowledge_base_stats: {
        documents_consulted: 0, // RAG recommendation doesn't expose this directly
        average_relevance: 0.7, // Default estimate
        search_time_ms: 0 // RAG recommendation doesn't expose this directly
      },
      
      model_info: {
        rag_provider: 'integrated_rag_system',
        gpt_model: gptResponse.model_info?.model || 'unknown',
        processing_time_ms: processingTime,
        tokens_used: gptResponse.model_info?.tokens_used || 0
      },
      
      // Follow-up
      follow_up_questions: gptResponse.follow_up_questions || [],
      related_queries: this.generateRelatedQueries(ragRecommendation.query?.query || '')
    }
  }

  private async generateRAGOnlyRecommendation(
    request: WeatherRecommendationRequest,
    startTime: number
  ): Promise<EnhancedWeatherRecommendation> {
    const ragRecommendation = await this.ragSystem.getRecommendation(request)
    const processingTime = Date.now() - startTime
    
    return {
      recommendation: ragRecommendation.recommendation,
      confidence: 0.6, // Lower confidence for RAG-only
      risk_assessment: {
        overall_risk: ragRecommendation.risk_assessment?.overall_risk || 'medium',
        specific_risks: ragRecommendation.risk_assessment?.specific_risks || [],
        risk_likelihood: {},
        severity_if_occurs: {},
        mitigation_strategies: ragRecommendation.risk_assessment?.mitigation_strategies || []
      },
      actionable_advice: ragRecommendation.actionable_advice || [],
      timing_recommendations: {
        optimal_windows: ragRecommendation.timing_recommendations?.optimal_windows || [],
        avoid_windows: ragRecommendation.timing_recommendations?.avoid_windows || [],
        monitoring_points: []
      },
      contingency_options: ragRecommendation.alternative_options || [],
      alternative_scenarios: [],
      data_sources: ragRecommendation.data_sources || [],
      rag_context_used: ragRecommendation.context_used || '',
      gpt_reasoning: 'RAG-only fallback mode (GPT unavailable)',
      knowledge_base_stats: {
        documents_consulted: 0, // RAG recommendation doesn't expose this directly
        average_relevance: 0.6, // Default estimate for fallback
        search_time_ms: 0 // RAG recommendation doesn't expose this directly
      },
      model_info: {
        rag_provider: 'integrated_rag_system',
        gpt_model: 'fallback_mode',
        processing_time_ms: processingTime,
        tokens_used: 0
      },
      follow_up_questions: [],
      related_queries: this.generateRelatedQueries(request.user_query)
    }
  }

  private generateCacheKey(request: WeatherRecommendationRequest): string {
    // Create a hash-like key from the request
    const keyData = {
      query: request.user_query,
      location: request.location,
      event_type: request.event_context?.event_type,
      start_time: request.event_context?.start_time
    }
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64').substring(0, 32)
  }

  private generateRelatedQueries(originalQuery: string): string[] {
    // Simple related query generation based on common weather concerns
    const relatedQueries: string[] = []
    
    const queryLower = originalQuery.toLowerCase()
    
    if (queryLower.includes('rain') || queryLower.includes('precipitation')) {
      relatedQueries.push('What are the best backup plans for rainy weather?')
      relatedQueries.push('How to protect equipment from rain?')
    }
    
    if (queryLower.includes('wind')) {
      relatedQueries.push('Wind speed thresholds for outdoor events')
      relatedQueries.push('How to secure structures in windy conditions?')
    }
    
    if (queryLower.includes('heat') || queryLower.includes('hot')) {
      relatedQueries.push('Heat safety guidelines for outdoor activities')
      relatedQueries.push('Best times to avoid extreme heat?')
    }
    
    if (queryLower.includes('thunder') || queryLower.includes('lightning')) {
      relatedQueries.push('Lightning safety protocols')
      relatedQueries.push('How long to wait after thunder stops?')
    }
    
    // Add generic related queries if none specific found
    if (relatedQueries.length === 0) {
      relatedQueries.push('Weather monitoring best practices')
      relatedQueries.push('Emergency weather contingency planning')
    }
    
    return relatedQueries.slice(0, 3) // Limit to 3 related queries
  }

  async addCustomKnowledge(content: string, metadata: any): Promise<void> {
    return this.ragSystem.addKnowledge(content, metadata)
  }

  async getSystemStats(): Promise<any> {
    const ragStats = await this.ragSystem.getKnowledgeStats()
    
    return {
      rag_system: ragStats,
      cache_size: this.responseCache.size,
      initialized: this.initialized,
      configuration: {
        use_rag_context: this.config.integration_settings?.use_rag_context,
        fallback_enabled: this.config.integration_settings?.fallback_to_rag_only,
        response_validation: this.config.integration_settings?.response_validation,
        cache_enabled: this.config.integration_settings?.cache_responses
      }
    }
  }

  clearCache(): void {
    this.responseCache.clear()
    console.log('🗑️ Response cache cleared')
  }
}

/**
 * Factory function for creating Weather Intelligence System
 */
export function createWeatherIntelligenceSystem(config: WeatherIntelligenceConfig): WeatherIntelligenceSystem {
  return new WeatherIntelligenceSystem(config)
}
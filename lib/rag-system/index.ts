/**
 * RAG System Integration
 * 
 * Main entry point for the Retrieval-Augmented Generation system.
 * Orchestrates knowledge management, retrieval, and context generation
 * for AI-powered weather recommendations.
 */

import { VectorDatabaseConfig, EmbeddingConfig } from './config'
import { createVectorDatabase } from './vector-db'
import { EmbeddingService } from './embeddings'
import { KnowledgeManager, WeatherDocumentProcessor } from './knowledge'
import { KnowledgeRetriever, RetrievalQuery, RetrievalResponse } from './retrieval'

export interface RAGSystemConfig {
  vector_db: VectorDatabaseConfig
  embedding_service: EmbeddingConfig
  knowledge_processing?: {
    chunk_size?: number
    overlap_size?: number
    strategy?: 'semantic' | 'fixed_size' | 'overlap'
  }
}

export interface WeatherRecommendationRequest {
  user_query: string
  location?: {
    latitude: number
    longitude: number
    name?: string
  }
  current_weather?: {
    temperature?: number
    humidity?: number
    wind_speed?: number
    conditions?: string[]
  }
  event_context?: {
    event_type: string
    start_time: string
    duration_hours?: number
    outdoor?: boolean
    participants?: number
  }
  user_preferences?: {
    risk_tolerance?: 'low' | 'medium' | 'high'
    activity_types?: string[]
    notification_preferences?: string[]
  }
}

export interface WeatherRecommendation {
  recommendation: string
  confidence_level: 'low' | 'medium' | 'high'
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high'
    specific_risks: string[]
    mitigation_strategies: string[]
  }
  actionable_advice: string[]
  alternative_options?: string[]
  timing_recommendations?: {
    optimal_windows: string[]
    avoid_windows: string[]
  }
  data_sources: string[]
  context_used: string
}

/**
 * Weather Knowledge Base - Pre-configured knowledge sets
 */
export class WeatherKnowledgeBase {
  
  static getWeatherPatterns(): Array<{ content: string; metadata: any }> {
    return [
      {
        content: `Cumulus clouds typically indicate fair weather conditions with minimal precipitation risk. These puffy, cotton-like clouds form during stable atmospheric conditions and are associated with light winds and clear visibility. For outdoor events, cumulus clouds generally provide favorable conditions with low precipitation probability (< 10%). However, rapid vertical development of cumulus clouds can indicate potential for afternoon thunderstorms, especially in summer months.`,
        metadata: {
          source: 'NOAA Weather Patterns Guide',
          weather_variables: ['clouds', 'precipitation', 'visibility'],
          event_types: ['outdoor event', 'sports', 'festival'],
          tags: ['clouds', 'fair weather', 'stability']
        }
      },
      {
        content: `Morning fog typically dissipates 2-4 hours after sunrise as surface temperatures rise and atmospheric mixing increases. Fog formation requires high humidity (>90%), light winds (<5 mph), and radiative cooling overnight. For morning outdoor activities, visibility can be severely reduced (<0.25 miles), creating safety hazards for transportation and outdoor sports. Plan events for after 10 AM during fog-prone seasons.`,
        metadata: {
          source: 'National Weather Service Fog Guidelines',
          weather_variables: ['fog', 'visibility', 'humidity', 'temperature'],
          event_types: ['transportation', 'outdoor event', 'sports'],
          temporal: { time_period: 'morning', season: 'fall' },
          tags: ['fog', 'visibility', 'safety', 'morning']
        }
      },
      {
        content: `Heat index values above 90°F indicate increased risk of heat-related illness during outdoor activities. When air temperature exceeds 85°F with humidity above 60%, the apparent temperature becomes significantly higher. For outdoor events lasting more than 2 hours, provide shade structures, frequent hydration breaks every 15-20 minutes, and consider rescheduling if heat index exceeds 105°F. Early morning (6-9 AM) or late afternoon (after 6 PM) timing reduces heat exposure.`,
        metadata: {
          source: 'CDC Heat Safety Guidelines',
          weather_variables: ['temperature', 'humidity', 'heat index'],
          event_types: ['outdoor event', 'sports', 'construction', 'festival'],
          temporal: { season: 'summer' },
          tags: ['heat', 'safety', 'health', 'timing']
        }
      },
      {
        content: `Wind speeds above 25 mph create challenging conditions for outdoor events, affecting tent stability, audio equipment, and participant comfort. Sustained winds of 35+ mph pose safety risks for temporary structures and should trigger event postponement. Wedding ceremonies, outdoor concerts, and festivals should monitor wind forecasts 24-48 hours in advance. Coastal and elevated locations experience 20-30% higher wind speeds than inland valleys.`,
        metadata: {
          source: 'Event Safety Weather Guidelines',
          weather_variables: ['wind', 'wind speed'],
          event_types: ['wedding', 'concert', 'festival', 'outdoor event'],
          tags: ['wind', 'safety', 'structures', 'planning']
        }
      },
      {
        content: `Precipitation probability above 30% warrants backup planning for outdoor events. Light rain (0.01-0.10 inches/hour) may continue activities with covered areas, but moderate rain (0.11-0.30 inches/hour) typically requires event modification or postponement. Thunder and lightning mandate immediate evacuation to enclosed structures. Monitor radar trends and timing - brief afternoon thunderstorms often clear within 1-2 hours.`,
        metadata: {
          source: 'National Weather Service Event Planning Guide',
          weather_variables: ['precipitation', 'rain', 'thunderstorm', 'lightning'],
          event_types: ['outdoor event', 'sports', 'wedding', 'festival'],
          tags: ['precipitation', 'planning', 'safety', 'backup']
        }
      }
    ]
  }

  static getSafetyGuidelines(): Array<{ content: string; metadata: any }> {
    return [
      {
        content: `Lightning safety requires the 30-30 rule: seek shelter when thunder follows lightning by 30 seconds or less, and wait 30 minutes after the last thunder before resuming outdoor activities. No outdoor location is safe during thunderstorms. Avoid elevated areas, water, metal objects, and isolated trees. Substantial buildings and enclosed vehicles provide protection. If caught in the open, crouch low with feet together, minimizing contact with the ground.`,
        metadata: {
          source: 'National Lightning Safety Institute',
          weather_variables: ['lightning', 'thunderstorm'],
          event_types: ['outdoor event', 'sports', 'construction', 'agriculture'],
          tags: ['lightning', 'safety', 'emergency', 'shelter']
        }
      },
      {
        content: `Cold weather safety becomes critical when temperatures drop below 32°F, especially with wind chill. Hypothermia risk increases when wind chill reaches 0°F or below. Outdoor event planning should include heated shelters, warm beverage stations, and first aid personnel trained in cold weather injuries. Encourage layered clothing and limit continuous outdoor exposure to 30-45 minutes in extreme cold conditions.`,
        metadata: {
          source: 'CDC Cold Weather Safety',
          weather_variables: ['temperature', 'wind chill', 'wind'],
          event_types: ['outdoor event', 'sports', 'emergency'],
          temporal: { season: 'winter' },
          tags: ['cold', 'safety', 'hypothermia', 'winter']
        }
      },
      {
        content: `Flash flood safety requires understanding local terrain and drainage patterns. Never drive or walk through flooded roads - just 6 inches of moving water can knock down an adult, and 12 inches can carry away a vehicle. Move to higher ground immediately when flash flood warnings are issued. For outdoor events near streams, washes, or low-lying areas, establish evacuation routes and communication protocols before weather deteriorates.`,
        metadata: {
          source: 'NOAA Flash Flood Safety',
          weather_variables: ['precipitation', 'flooding'],
          event_types: ['outdoor event', 'emergency', 'transportation'],
          tags: ['flooding', 'safety', 'evacuation', 'terrain']
        }
      }
    ]
  }

  static getHistoricalEvents(): Array<{ content: string; metadata: any }> {
    return [
      {
        content: `The 2019 Woodstock 50 festival cancellation demonstrates the impact of severe weather on large outdoor events. Heavy rainfall and flooding made venue conditions unsafe, leading to complete event cancellation despite months of planning. Modern weather monitoring and flexible venue agreements could have enabled earlier decision-making and potential relocation. This case highlights the importance of weather contingency planning for multi-day outdoor festivals.`,
        metadata: {
          source: 'Event Industry Weather Case Studies',
          weather_variables: ['precipitation', 'flooding'],
          event_types: ['festival', 'outdoor event'],
          temporal: { date: '2019-08-16' },
          tags: ['festival', 'cancellation', 'planning', 'case study']
        }
      },
      {
        content: `Super Bowl XLVIII (2014) in MetLife Stadium faced extreme cold with game-time temperature of 49°F and wind chill near 30°F. This marked the coldest outdoor Super Bowl in history. Event organizers implemented extensive cold weather protocols including heated fan zones, additional medical personnel, and modified concession operations. The game proceeded successfully, demonstrating that proper preparation enables outdoor events even in challenging conditions.`,
        metadata: {
          source: 'NFL Weather Management Records',
          weather_variables: ['temperature', 'wind chill'],
          event_types: ['sports', 'outdoor event'],
          temporal: { date: '2014-02-02', season: 'winter' },
          tags: ['cold weather', 'sports', 'preparation', 'success']
        }
      }
    ]
  }
}

/**
 * Main RAG System Class
 */
export class RAGSystem {
  private vectorDb: any
  private embeddingService: any
  private knowledgeManager: KnowledgeManager | null = null
  private retriever: KnowledgeRetriever | null = null
  private config: RAGSystemConfig
  private initialized = false

  constructor(config: RAGSystemConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('RAG System already initialized')
      return
    }

    console.log('🚀 Initializing RAG System...')

    try {
      // Initialize vector database
      console.log('Setting up vector database...')
      this.vectorDb = createVectorDatabase(this.config.vector_db)
      await this.vectorDb.initialize()
      await this.vectorDb.createIndex()

      // Initialize embedding service
      console.log('Setting up embedding service...')
      this.embeddingService = new EmbeddingService(this.config.embedding_service)

      // Initialize knowledge manager
      console.log('Setting up knowledge management...')
      const processingConfig = this.config.knowledge_processing || {}
      const documentProcessor = new WeatherDocumentProcessor(
        processingConfig.chunk_size || 512,
        processingConfig.overlap_size || 64,
        processingConfig.strategy || 'semantic'
      )
      
      this.knowledgeManager = new KnowledgeManager(
        this.vectorDb,
        this.embeddingService,
        documentProcessor
      )
      await this.knowledgeManager.initialize()

      // Initialize retriever
      console.log('Setting up knowledge retrieval...')
      this.retriever = new KnowledgeRetriever(
        this.vectorDb,
        this.embeddingService
      )
      await this.retriever.initialize()

      this.initialized = true
      console.log('✅ RAG System initialization complete')

    } catch (error) {
      console.error('❌ RAG System initialization failed:', error)
      throw error
    }
  }

  async loadDefaultKnowledge(): Promise<void> {
    if (!this.knowledgeManager) {
      throw new Error('RAG System not initialized')
    }

    console.log('📚 Loading default weather knowledge base...')

    try {
      // Load weather patterns
      const patterns = WeatherKnowledgeBase.getWeatherPatterns()
      const patternResults = await this.knowledgeManager.ingestDocuments(patterns)
      console.log(`✅ Loaded ${patternResults.documents_created} weather pattern documents`)

      // Load safety guidelines
      const safety = WeatherKnowledgeBase.getSafetyGuidelines()
      const safetyResults = await this.knowledgeManager.ingestDocuments(safety)
      console.log(`✅ Loaded ${safetyResults.documents_created} safety guideline documents`)

      // Load historical events
      const historical = WeatherKnowledgeBase.getHistoricalEvents()
      const historicalResults = await this.knowledgeManager.ingestDocuments(historical)
      console.log(`✅ Loaded ${historicalResults.documents_created} historical event documents`)

      const totalDocs = patternResults.documents_created + safetyResults.documents_created + historicalResults.documents_created
      console.log(`📊 Total knowledge base: ${totalDocs} documents loaded`)

    } catch (error) {
      console.error('❌ Failed to load default knowledge:', error)
      throw error
    }
  }

  async getRecommendation(request: WeatherRecommendationRequest): Promise<WeatherRecommendation> {
    if (!this.retriever) {
      throw new Error('RAG System not initialized')
    }

    console.log(`🧠 Generating recommendation for: "${request.user_query}"`)

    try {
      // Build comprehensive retrieval query
      const retrievalQuery: RetrievalQuery = {
        query: request.user_query,
        location: request.location,
        weather_context: {
          current_conditions: request.current_weather?.conditions,
          event_types: request.event_context ? [request.event_context.event_type] : undefined
        },
        filters: {
          min_confidence: 0.5
        },
        retrieval_settings: {
          max_results: 15,
          similarity_threshold: 0.6,
          diversify_results: true
        }
      }

      // Add temporal context if available
      if (request.event_context?.start_time) {
        const eventDate = new Date(request.event_context.start_time)
        const season = this.getSeason(eventDate.getMonth())
        const timeOfDay = this.getTimeOfDay(eventDate.getHours())
        
        retrievalQuery.temporal = {
          start_date: request.event_context.start_time,
          season,
          time_of_day: timeOfDay
        }
      }

      // Retrieve relevant knowledge
      const retrievalResponse = await this.retriever.retrieve(retrievalQuery)

      // Generate structured recommendation
      const recommendation = this.generateStructuredRecommendation(
        request,
        retrievalResponse
      )

      console.log(`✅ Generated ${recommendation.confidence_level} confidence recommendation`)
      
      return recommendation

    } catch (error) {
      console.error('❌ Failed to generate recommendation:', error)
      throw error
    }
  }

  async addKnowledge(content: string, metadata: any): Promise<void> {
    if (!this.knowledgeManager) {
      throw new Error('RAG System not initialized')
    }

    const result = await this.knowledgeManager.ingestDocument(content, metadata)
    
    if (!result.success) {
      throw new Error(`Failed to add knowledge: ${result.errors?.join(', ')}`)
    }

    console.log(`✅ Added knowledge: ${result.documents_created} documents created`)
  }

  async getKnowledgeStats(): Promise<any> {
    if (!this.knowledgeManager) {
      throw new Error('RAG System not initialized')
    }

    return this.knowledgeManager.getKnowledgeStats()
  }

  private generateStructuredRecommendation(
    request: WeatherRecommendationRequest,
    retrievalResponse: RetrievalResponse
  ): WeatherRecommendation {
    const results = retrievalResponse.results
    
    // Calculate overall confidence based on retrieval quality
    const avgRelevance = results.length > 0 
      ? results.reduce((sum, r) => sum + r.relevance_score, 0) / results.length
      : 0
    
    const confidenceLevel: 'low' | 'medium' | 'high' = 
      avgRelevance > 0.8 ? 'high' : avgRelevance > 0.6 ? 'medium' : 'low'

    // Extract risk information from retrieved knowledge
    const riskFactors = this.extractRiskFactors(results)
    const mitigationStrategies = this.extractMitigationStrategies(results)
    const actionableAdvice = this.extractActionableAdvice(results, request)

    // Generate main recommendation text
    const recommendationText = this.generateRecommendationText(request, results, riskFactors)

    // Extract data sources
    const dataSources = Array.from(new Set(results.map(r => r.document.metadata.source)))

    return {
      recommendation: recommendationText,
      confidence_level: confidenceLevel,
      risk_assessment: {
        overall_risk: this.assessOverallRisk(riskFactors, request),
        specific_risks: riskFactors,
        mitigation_strategies: mitigationStrategies
      },
      actionable_advice: actionableAdvice,
      alternative_options: this.generateAlternativeOptions(request, riskFactors),
      timing_recommendations: this.generateTimingRecommendations(results, request),
      data_sources: dataSources,
      context_used: retrievalResponse.context_summary
    }
  }

  private getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  private extractRiskFactors(results: any[]): string[] {
    const risks = new Set<string>()
    
    results.forEach(result => {
      const content = result.document.content.toLowerCase()
      
      if (content.includes('lightning') || content.includes('thunderstorm')) {
        risks.add('Lightning and thunderstorm risk')
      }
      if (content.includes('heat') && content.includes('illness')) {
        risks.add('Heat-related illness risk')
      }
      if (content.includes('wind') && content.includes('mph')) {
        risks.add('High wind conditions')
      }
      if (content.includes('precipitation') || content.includes('rain')) {
        risks.add('Precipitation risk')
      }
      if (content.includes('cold') || content.includes('hypothermia')) {
        risks.add('Cold weather exposure risk')
      }
      if (content.includes('flood')) {
        risks.add('Flooding risk')
      }
    })
    
    return Array.from(risks)
  }

  private extractMitigationStrategies(results: any[]): string[] {
    const strategies = new Set<string>()
    
    results.forEach(result => {
      const content = result.document.content.toLowerCase()
      
      if (content.includes('shelter') || content.includes('indoor')) {
        strategies.add('Secure indoor shelter or covered areas')
      }
      if (content.includes('hydration') || content.includes('water')) {
        strategies.add('Ensure adequate hydration and cooling')
      }
      if (content.includes('backup') || content.includes('alternative')) {
        strategies.add('Prepare backup plans and alternative venues')
      }
      if (content.includes('monitor') || content.includes('watch')) {
        strategies.add('Continuous weather monitoring and updates')
      }
      if (content.includes('timing') || content.includes('reschedule')) {
        strategies.add('Consider timing adjustments or rescheduling')
      }
    })
    
    return Array.from(strategies)
  }

  private extractActionableAdvice(results: any[], request: WeatherRecommendationRequest): string[] {
    const advice = new Set<string>()
    
    // Generic advice based on event type
    if (request.event_context?.outdoor) {
      advice.add('Monitor weather conditions 24-48 hours before the event')
      advice.add('Have a clear communication plan for weather updates')
    }

    // Specific advice from knowledge base
    results.forEach(result => {
      const content = result.document.content
      
      // Extract specific recommendations from content
      const sentences = content.split(/[.!?]+/)
      sentences.forEach((sentence: string) => {
        if (sentence.toLowerCase().includes('should') || 
            sentence.toLowerCase().includes('recommend') ||
            sentence.toLowerCase().includes('plan')) {
          const cleaned = sentence.trim()
          if (cleaned.length > 20 && cleaned.length < 150) {
            advice.add(cleaned)
          }
        }
      })
    })
    
    return Array.from(advice).slice(0, 5) // Limit to 5 key pieces of advice
  }

  private generateRecommendationText(
    request: WeatherRecommendationRequest,
    results: any[],
    riskFactors: string[]
  ): string {
    const eventType = request.event_context?.event_type || 'outdoor activity'
    const location = request.location?.name || 'your location'
    
    let recommendation = `For your ${eventType} at ${location}, `
    
    if (riskFactors.length === 0) {
      recommendation += 'current weather conditions appear favorable with minimal risks identified. '
    } else if (riskFactors.length <= 2) {
      recommendation += `moderate weather risks have been identified: ${riskFactors.join(' and ')}. `
    } else {
      recommendation += `several weather risks require attention: ${riskFactors.slice(0, 2).join(', ')}, and others. `
    }
    
    // Add contextual advice based on best matching knowledge
    if (results.length > 0) {
      const topResult = results[0]
      const keyInsight = this.extractKeyInsight(topResult.document.content)
      if (keyInsight) {
        recommendation += keyInsight + ' '
      }
    }
    
    recommendation += 'Continue monitoring conditions and consider the specific recommendations provided.'
    
    return recommendation
  }

  private extractKeyInsight(content: string): string {
    // Extract the most relevant sentence from the content
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)
    
    // Prefer sentences with specific numbers or actionable advice
    for (const sentence of sentences) {
      if (sentence.match(/\d+/) && (sentence.includes('above') || sentence.includes('below') || sentence.includes('exceed'))) {
        return sentence + '.'
      }
    }
    
    // Return first meaningful sentence
    return sentences[0] ? sentences[0] + '.' : ''
  }

  private assessOverallRisk(riskFactors: string[], request: WeatherRecommendationRequest): 'low' | 'medium' | 'high' {
    if (riskFactors.length === 0) return 'low'
    
    // High-priority risks
    const highRisks = ['Lightning and thunderstorm risk', 'Flooding risk', 'Heat-related illness risk']
    const hasHighRisk = riskFactors.some(risk => highRisks.includes(risk))
    
    if (hasHighRisk) return 'high'
    if (riskFactors.length >= 3) return 'high'
    if (riskFactors.length >= 2) return 'medium'
    
    return 'low'
  }

  private generateAlternativeOptions(request: WeatherRecommendationRequest, riskFactors: string[]): string[] {
    const alternatives: string[] = []
    
    if (request.event_context?.outdoor && riskFactors.length > 0) {
      alternatives.push('Move event to covered or indoor venue')
      alternatives.push('Postpone to a day with better weather conditions')
      alternatives.push('Modify event duration or schedule to avoid peak risk periods')
    }
    
    if (riskFactors.some(r => r.includes('heat'))) {
      alternatives.push('Reschedule to early morning or evening hours')
      alternatives.push('Provide additional shade and cooling stations')
    }
    
    if (riskFactors.some(r => r.includes('precipitation'))) {
      alternatives.push('Secure weather-resistant backup venue')
      alternatives.push('Provide weather protection equipment for participants')
    }
    
    return alternatives
  }

  private generateTimingRecommendations(results: any[], request: WeatherRecommendationRequest): any {
    // Extract timing insights from knowledge base
    const timingInsights = {
      optimal_windows: [] as string[],
      avoid_windows: [] as string[]
    }
    
    results.forEach(result => {
      const content = result.document.content.toLowerCase()
      
      if (content.includes('morning') && content.includes('better')) {
        timingInsights.optimal_windows.push('Early morning hours (6-9 AM)')
      }
      if (content.includes('afternoon') && (content.includes('avoid') || content.includes('risk'))) {
        timingInsights.avoid_windows.push('Peak afternoon hours (12-4 PM)')
      }
      if (content.includes('evening') && content.includes('optimal')) {
        timingInsights.optimal_windows.push('Evening hours (6-8 PM)')
      }
    })
    
    return timingInsights
  }
}

// Export main interfaces and classes
export type {
  VectorDatabaseConfig,
  EmbeddingConfig,
  RetrievalQuery,
  RetrievalResponse
}
export {
  KnowledgeManager,
  KnowledgeRetriever
}
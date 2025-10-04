/**
 * Knowledge Retrieval System
 * 
 * Handles intelligent retrieval of relevant weather and climate knowledge
 * for generating context-aware AI recommendations.
 */

import { KnowledgeDocument, VectorDatabaseConfig } from './config'
import { VectorDatabase } from './vector-db'
import { EmbeddingService } from './embeddings'

export interface RetrievalQuery {
  query: string
  location?: {
    latitude: number
    longitude: number
    radius_km?: number
  }
  temporal?: {
    start_date?: string
    end_date?: string
    season?: 'spring' | 'summer' | 'fall' | 'winter'
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'
  }
  weather_context?: {
    current_conditions?: string[]
    forecast_variables?: string[]
    event_types?: string[]
  }
  filters?: {
    document_types?: KnowledgeDocument['type'][]
    sources?: string[]
    min_confidence?: number
    max_age_days?: number
    tags?: string[]
  }
  retrieval_settings?: {
    max_results?: number
    similarity_threshold?: number
    diversify_results?: boolean
    include_metadata?: boolean
  }
}

export interface RetrievalResult {
  document: KnowledgeDocument
  similarity_score: number
  relevance_score: number
  explanation?: string
}

export interface RetrievalResponse {
  query: RetrievalQuery
  results: RetrievalResult[]
  total_found: number
  search_time_ms: number
  context_summary: string
  retrieval_strategy: string
}

export interface ContextGenerator {
  generateContext(query: RetrievalQuery, results: RetrievalResult[]): Promise<string>
}

/**
 * Semantic Similarity Scorer
 */
export class SimilarityScorer {
  
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length')
    }
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  static calculateRelevanceScore(
    document: KnowledgeDocument,
    query: RetrievalQuery,
    similarityScore: number
  ): number {
    let relevanceScore = similarityScore * 0.6 // Base similarity weight
    
    // Temporal relevance
    if (query.temporal && document.metadata.temporal) {
      const temporalRelevance = this.calculateTemporalRelevance(query.temporal, document.metadata.temporal)
      relevanceScore += temporalRelevance * 0.2
    }
    
    // Location relevance
    if (query.location && document.metadata.location) {
      const locationRelevance = this.calculateLocationRelevance(query.location, document.metadata.location)
      relevanceScore += locationRelevance * 0.15
    }
    
    // Confidence boost
    relevanceScore += (document.metadata.confidence_score || 0.5) * 0.05
    
    // Recency boost (more recent documents get slight preference)
    if (document.metadata.last_updated) {
      const ageYears = (Date.now() - new Date(document.metadata.last_updated).getTime()) / (365 * 24 * 60 * 60 * 1000)
      const recencyBoost = Math.max(0, (5 - ageYears) / 5) * 0.05
      relevanceScore += recencyBoost
    }
    
    return Math.max(0, Math.min(1, relevanceScore))
  }

  private static calculateTemporalRelevance(
    queryTemporal: NonNullable<RetrievalQuery['temporal']>,
    docTemporal: NonNullable<KnowledgeDocument['metadata']['temporal']>
  ): number {
    let relevance = 0
    
    // Season matching
    if (queryTemporal.season && docTemporal.season) {
      relevance += queryTemporal.season === docTemporal.season ? 0.3 : 0
    }
    
    // Time of day matching
    if (queryTemporal.time_of_day && docTemporal.time_period) {
      relevance += queryTemporal.time_of_day === docTemporal.time_period ? 0.2 : 0
    }
    
    // Date range overlap
    if (queryTemporal.start_date && queryTemporal.end_date && docTemporal.date) {
      const queryStart = new Date(queryTemporal.start_date)
      const queryEnd = new Date(queryTemporal.end_date)
      const docDate = new Date(docTemporal.date)
      
      if (docDate >= queryStart && docDate <= queryEnd) {
        relevance += 0.5
      }
    }
    
    return Math.min(1, relevance)
  }

  private static calculateLocationRelevance(
    queryLocation: NonNullable<RetrievalQuery['location']>,
    docLocation: NonNullable<KnowledgeDocument['metadata']['location']>
  ): number {
    if (!docLocation.lat || !docLocation.lon) {
      return 0
    }
    
    const distance = this.haversineDistance(
      queryLocation.latitude,
      queryLocation.longitude,
      docLocation.lat,
      docLocation.lon
    )
    
    const maxDistance = queryLocation.radius_km || 100 // Default 100km radius
    
    if (distance <= maxDistance) {
      return 1 - (distance / maxDistance) // Closer = higher relevance
    }
    
    return 0
  }

  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

/**
 * Weather Context Generator
 */
export class WeatherContextGenerator implements ContextGenerator {
  
  async generateContext(query: RetrievalQuery, results: RetrievalResult[]): Promise<string> {
    if (results.length === 0) {
      return 'No relevant weather information found for this query.'
    }
    
    const contextSections: string[] = []
    
    // Add query context
    contextSections.push(this.generateQueryContext(query))
    
    // Group results by type for better organization
    const resultsByType = this.groupResultsByType(results)
    
    // Generate context for each type
    for (const [type, typeResults] of Object.entries(resultsByType)) {
      const typeContext = this.generateTypeContext(type, typeResults)
      if (typeContext) {
        contextSections.push(typeContext)
      }
    }
    
    // Add summary statistics
    contextSections.push(this.generateSummaryContext(results))
    
    return contextSections.join('\n\n')
  }

  private generateQueryContext(query: RetrievalQuery): string {
    const parts: string[] = []
    
    parts.push(`User Query: "${query.query}"`)
    
    if (query.location) {
      parts.push(`Location: ${query.location.latitude.toFixed(2)}, ${query.location.longitude.toFixed(2)}`)
      if (query.location.radius_km) {
        parts.push(`Search Radius: ${query.location.radius_km}km`)
      }
    }
    
    if (query.temporal) {
      const temporal: string[] = []
      if (query.temporal.season) temporal.push(`Season: ${query.temporal.season}`)
      if (query.temporal.time_of_day) temporal.push(`Time: ${query.temporal.time_of_day}`)
      if (query.temporal.start_date && query.temporal.end_date) {
        temporal.push(`Date Range: ${query.temporal.start_date} to ${query.temporal.end_date}`)
      }
      if (temporal.length > 0) {
        parts.push(temporal.join(', '))
      }
    }
    
    if (query.weather_context?.current_conditions) {
      parts.push(`Current Conditions: ${query.weather_context.current_conditions.join(', ')}`)
    }
    
    return parts.join('\n')
  }

  private groupResultsByType(results: RetrievalResult[]): Record<string, RetrievalResult[]> {
    const grouped: Record<string, RetrievalResult[]> = {}
    
    for (const result of results) {
      const type = result.document.type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(result)
    }
    
    return grouped
  }

  private generateTypeContext(type: string, results: RetrievalResult[]): string {
    if (results.length === 0) return ''
    
    const typeLabel = this.getTypeLabelForContext(type)
    const contextParts: string[] = [`=== ${typeLabel} ===`]
    
    // Sort by relevance score
    const sortedResults = results.sort((a, b) => b.relevance_score - a.relevance_score)
    
    // Include top results with content
    const topResults = sortedResults.slice(0, 3) // Limit to top 3 per type
    
    for (const result of topResults) {
      const doc = result.document
      const score = (result.relevance_score * 100).toFixed(1)
      
      contextParts.push(`${doc.title} (Relevance: ${score}%)`)
      
      // Include condensed content
      const condensedContent = this.condenseContent(doc.content, 200)
      contextParts.push(condensedContent)
      
      // Include key metadata
      const metadata: string[] = []
      if (doc.metadata.source) metadata.push(`Source: ${doc.metadata.source}`)
      if (doc.metadata.weather_variables?.length) {
        metadata.push(`Variables: ${doc.metadata.weather_variables.slice(0, 3).join(', ')}`)
      }
      if (doc.metadata.location?.region) metadata.push(`Location: ${doc.metadata.location.region}`)
      
      if (metadata.length > 0) {
        contextParts.push(`[${metadata.join(' | ')}]`)
      }
      
      contextParts.push('') // Empty line between results
    }
    
    return contextParts.join('\n')
  }

  private generateSummaryContext(results: RetrievalResult[]): string {
    const total = results.length
    const avgRelevance = results.reduce((sum, r) => sum + r.relevance_score, 0) / total
    const sources = new Set(results.map(r => r.document.metadata.source))
    const types = new Set(results.map(r => r.document.type))
    
    return [
      '=== Summary ===',
      `Total relevant documents: ${total}`,
      `Average relevance: ${(avgRelevance * 100).toFixed(1)}%`,
      `Sources: ${Array.from(sources).join(', ')}`,
      `Document types: ${Array.from(types).map(t => this.getTypeLabelForContext(t)).join(', ')}`
    ].join('\n')
  }

  private getTypeLabelForContext(type: string): string {
    const labels: Record<string, string> = {
      'weather_pattern': 'Weather Patterns & Trends',
      'historical_event': 'Historical Weather Events',
      'climate_data': 'Climate Data & Analysis',
      'safety_guideline': 'Safety Guidelines',
      'user_feedback': 'User Experiences',
      'nasa_data': 'NASA Earth Science Data'
    }
    
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  private condenseContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content
    }
    
    // Try to break at sentence boundaries
    const sentences = content.split(/[.!?]+/)
    let condensed = ''
    
    for (const sentence of sentences) {
      if (condensed.length + sentence.length + 1 <= maxLength - 3) {
        condensed += sentence + '.'
      } else {
        break
      }
    }
    
    if (condensed.length === 0) {
      // If no complete sentences fit, truncate at word boundary
      const words = content.split(' ')
      for (const word of words) {
        if (condensed.length + word.length + 1 <= maxLength - 3) {
          condensed += word + ' '
        } else {
          break
        }
      }
    }
    
    return condensed.trim() + '...'
  }
}

/**
 * Knowledge Retrieval System - Main class
 */
export class KnowledgeRetriever {
  private vectorDb: VectorDatabase
  private embeddingService: EmbeddingService
  private contextGenerator: ContextGenerator

  constructor(
    vectorDb: VectorDatabase,
    embeddingService: EmbeddingService,
    contextGenerator?: ContextGenerator
  ) {
    this.vectorDb = vectorDb
    this.embeddingService = embeddingService
    this.contextGenerator = contextGenerator || new WeatherContextGenerator()
  }

  async initialize(): Promise<void> {
    console.log('Initializing Knowledge Retrieval System...')
    await this.vectorDb.initialize()
    console.log('✅ Knowledge Retrieval System initialized')
  }

  async retrieve(query: RetrievalQuery): Promise<RetrievalResponse> {
    const startTime = Date.now()
    
    console.log(`🔍 Retrieving knowledge for: "${query.query}"`)
    
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.embedText(query.query)
      
      // Set default retrieval settings
      const settings = {
        max_results: 20,
        similarity_threshold: 0.7,
        diversify_results: true,
        include_metadata: true,
        ...query.retrieval_settings
      }
      
      // Search vector database
      const searchResults = await this.vectorDb.search(
        queryEmbedding.embedding,
        settings.max_results * 2 // Get more results for filtering
      )
      
      // Apply filters and calculate relevance scores
      const filteredResults = this.applyFilters(searchResults, query)
      const scoredResults = await this.calculateRelevanceScores(filteredResults, query)
      
      // Apply similarity threshold
      const validResults = scoredResults.filter(r => r.similarity_score >= settings.similarity_threshold)
      
      // Diversify results if requested
      const finalResults = settings.diversify_results 
        ? this.diversifyResults(validResults, settings.max_results)
        : validResults.slice(0, settings.max_results)
      
      // Generate context summary
      const contextSummary = await this.contextGenerator.generateContext(query, finalResults)
      
      const searchTime = Date.now() - startTime
      
      console.log(`✅ Retrieved ${finalResults.length} documents in ${searchTime}ms`)
      
      return {
        query,
        results: finalResults,
        total_found: validResults.length,
        search_time_ms: searchTime,
        context_summary: contextSummary,
        retrieval_strategy: this.getRetrievalStrategy(query, settings)
      }
      
    } catch (error) {
      console.error('❌ Error during knowledge retrieval:', error)
      throw error
    }
  }

  private applyFilters(
    searchResults: Array<{ document: KnowledgeDocument; score: number }>,
    query: RetrievalQuery
  ): Array<{ document: KnowledgeDocument; score: number }> {
    let filtered = searchResults
    
    const filters = query.filters
    if (!filters) return filtered
    
    // Filter by document types
    if (filters.document_types?.length) {
      filtered = filtered.filter(r => filters.document_types!.includes(r.document.type))
    }
    
    // Filter by sources
    if (filters.sources?.length) {
      filtered = filtered.filter(r => filters.sources!.includes(r.document.metadata.source))
    }
    
    // Filter by confidence score
    if (filters.min_confidence !== undefined) {
      filtered = filtered.filter(r => (r.document.metadata.confidence_score || 0) >= filters.min_confidence!)
    }
    
    // Filter by age
    if (filters.max_age_days !== undefined) {
      const maxAge = Date.now() - (filters.max_age_days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(r => {
        const lastUpdated = new Date(r.document.metadata.last_updated).getTime()
        return lastUpdated >= maxAge
      })
    }
    
    // Filter by tags
    if (filters.tags?.length) {
      filtered = filtered.filter(r => {
        const docTags = r.document.metadata.tags || []
        return filters.tags!.some(tag => docTags.includes(tag))
      })
    }
    
    return filtered
  }

  private async calculateRelevanceScores(
    searchResults: Array<{ document: KnowledgeDocument; score: number }>,
    query: RetrievalQuery
  ): Promise<RetrievalResult[]> {
    return searchResults.map(result => {
      const relevanceScore = SimilarityScorer.calculateRelevanceScore(
        result.document,
        query,
        result.score
      )
      
      return {
        document: result.document,
        similarity_score: result.score,
        relevance_score: relevanceScore,
        explanation: this.generateExplanation(result.document, query, result.score, relevanceScore)
      }
    })
  }

  private diversifyResults(results: RetrievalResult[], maxResults: number): RetrievalResult[] {
    if (results.length <= maxResults) {
      return results.sort((a, b) => b.relevance_score - a.relevance_score)
    }
    
    const diversified: RetrievalResult[] = []
    const usedTypes = new Set<string>()
    const usedSources = new Set<string>()
    
    // Sort by relevance first
    const sorted = results.sort((a, b) => b.relevance_score - a.relevance_score)
    
    // First pass: include top result from each type/source
    for (const result of sorted) {
      if (diversified.length >= maxResults) break
      
      const type = result.document.type
      const source = result.document.metadata.source
      
      if (!usedTypes.has(type) || !usedSources.has(source)) {
        diversified.push(result)
        usedTypes.add(type)
        usedSources.add(source)
      }
    }
    
    // Second pass: fill remaining slots with highest relevance
    for (const result of sorted) {
      if (diversified.length >= maxResults) break
      
      if (!diversified.includes(result)) {
        diversified.push(result)
      }
    }
    
    return diversified
  }

  private generateExplanation(
    document: KnowledgeDocument,
    query: RetrievalQuery,
    similarityScore: number,
    relevanceScore: number
  ): string {
    const explanations: string[] = []
    
    explanations.push(`Semantic similarity: ${(similarityScore * 100).toFixed(1)}%`)
    
    if (query.location && document.metadata.location) {
      explanations.push('Location match found')
    }
    
    if (query.temporal && document.metadata.temporal) {
      explanations.push('Temporal context match')
    }
    
    if ((document.metadata.confidence_score || 0) > 0.8) {
      explanations.push('High confidence source')
    }
    
    if (query.weather_context?.event_types && document.metadata.event_types) {
      const matchingEvents = query.weather_context.event_types.filter(event =>
        document.metadata.event_types?.includes(event)
      )
      if (matchingEvents.length > 0) {
        explanations.push(`Event type match: ${matchingEvents.join(', ')}`)
      }
    }
    
    return explanations.join(' | ')
  }

  private getRetrievalStrategy(query: RetrievalQuery, settings: any): string {
    const strategies: string[] = []
    
    strategies.push('semantic_similarity')
    
    if (query.location) strategies.push('location_filtering')
    if (query.temporal) strategies.push('temporal_filtering')
    if (query.filters) strategies.push('metadata_filtering')
    if (settings.diversify_results) strategies.push('result_diversification')
    
    return strategies.join(' + ')
  }

  async getRecommendations(
    query: string,
    location?: { latitude: number; longitude: number },
    options?: Partial<RetrievalQuery>
  ): Promise<RetrievalResponse> {
    const retrievalQuery: RetrievalQuery = {
      query,
      location,
      retrieval_settings: {
        max_results: 10,
        similarity_threshold: 0.6,
        diversify_results: true,
        include_metadata: true
      },
      ...options
    }
    
    return this.retrieve(retrievalQuery)
  }
}
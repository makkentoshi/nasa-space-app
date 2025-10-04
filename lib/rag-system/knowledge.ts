/**
 * Knowledge Management System
 * 
 * Manages the ingestion, processing, and organization of weather and climate
 * knowledge documents for the RAG system.
 */

import { KnowledgeDocument, KNOWLEDGE_CATEGORIES } from './config'
import { EmbeddingService } from './embeddings'
import { VectorDatabase } from './vector-db'

export interface DocumentProcessor {
  processDocument(rawContent: string, metadata: Partial<KnowledgeDocument['metadata']>): Promise<KnowledgeDocument[]>
}

export interface IngestionResult {
  success: boolean
  documents_processed: number
  documents_created: number
  chunks_created: number
  processing_time_ms: number
  errors?: string[]
  warnings?: string[]
}

export interface KnowledgeStats {
  total_documents: number
  documents_by_type: Record<string, number>
  documents_by_source: Record<string, number>
  average_document_length: number
  total_embeddings: number
  last_updated: string
  storage_size_mb: number
}

/**
 * Text Chunking Strategies
 */
export class TextChunker {
  
  static chunkByFixedSize(text: string, chunkSize: number, overlapSize: number): string[] {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    let currentChunk = ''
    let currentSize = 0
    
    for (const sentence of sentences) {
      const sentenceLength = sentence.trim().length
      
      if (currentSize + sentenceLength > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        
        // Create overlap
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.floor(overlapSize / 10))
        currentChunk = overlapWords.join(' ') + ' ' + sentence.trim()
        currentSize = currentChunk.length
      } else {
        currentChunk += ' ' + sentence.trim()
        currentSize += sentenceLength
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks.filter(chunk => chunk.length > 50) // Filter out very small chunks
  }

  static chunkBySemantic(text: string, chunkSize: number): string[] {
    // Simple semantic chunking based on topic boundaries
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const chunks: string[] = []
    
    let currentChunk = ''
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        currentChunk = paragraph
      } else {
        currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + paragraph
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim())
    }
    
    // Further split large paragraphs
    const finalChunks: string[] = []
    for (const chunk of chunks) {
      if (chunk.length > chunkSize * 1.5) {
        const subChunks = this.chunkByFixedSize(chunk, chunkSize, 50)
        finalChunks.push(...subChunks)
      } else {
        finalChunks.push(chunk)
      }
    }
    
    return finalChunks
  }

  static chunkByOverlapping(text: string, chunkSize: number, overlapSize: number): string[] {
    const chunks: string[] = []
    const step = chunkSize - overlapSize
    
    for (let i = 0; i < text.length; i += step) {
      const chunk = text.substring(i, i + chunkSize)
      if (chunk.trim().length > 50) {
        chunks.push(chunk.trim())
      }
    }
    
    return chunks
  }
}

/**
 * Weather Knowledge Document Processor
 */
export class WeatherDocumentProcessor implements DocumentProcessor {
  private chunkSize: number
  private overlapSize: number
  private strategy: 'semantic' | 'fixed_size' | 'overlap'

  constructor(chunkSize = 512, overlapSize = 64, strategy: 'semantic' | 'fixed_size' | 'overlap' = 'semantic') {
    this.chunkSize = chunkSize
    this.overlapSize = overlapSize
    this.strategy = strategy
  }

  async processDocument(rawContent: string, metadata: Partial<KnowledgeDocument['metadata']>): Promise<KnowledgeDocument[]> {
    // Clean and preprocess the content
    const cleanedContent = this.cleanContent(rawContent)
    
    // Determine document type from content analysis
    const documentType = this.inferDocumentType(cleanedContent, metadata)
    
    // Extract key information
    const extractedInfo = this.extractKeyInformation(cleanedContent, documentType)
    
    // Chunk the content
    let chunks: string[]
    switch (this.strategy) {
      case 'semantic':
        chunks = TextChunker.chunkBySemantic(cleanedContent, this.chunkSize)
        break
      case 'fixed_size':
        chunks = TextChunker.chunkByFixedSize(cleanedContent, this.chunkSize, this.overlapSize)
        break
      case 'overlap':
        chunks = TextChunker.chunkByOverlapping(cleanedContent, this.chunkSize, this.overlapSize)
        break
    }
    
    // Create knowledge documents for each chunk
    const documents: KnowledgeDocument[] = chunks.map((chunk, index) => ({
      id: `${metadata.source || 'unknown'}_${Date.now()}_${index}`,
      type: documentType,
      title: this.generateTitle(chunk, metadata, index),
      content: chunk,
      metadata: {
        source: metadata.source || 'unknown',
        location: metadata.location,
        temporal: metadata.temporal,
        weather_variables: extractedInfo.weatherVariables,
        event_types: extractedInfo.eventTypes,
        confidence_score: this.calculateConfidenceScore(chunk, metadata),
        last_updated: new Date().toISOString(),
        tags: [...(metadata.tags || []), ...extractedInfo.tags],
        language: metadata.language || 'en'
      }
    }))
    
    return documents
  }

  private cleanContent(content: string): string {
    // Remove excessive whitespace
    let cleaned = content.replace(/\s+/g, ' ').trim()
    
    // Remove common artifacts
    cleaned = cleaned.replace(/\[page \d+\]/gi, '')
    cleaned = cleaned.replace(/\bhttps?:\/\/\S+\b/gi, '[URL]')
    cleaned = cleaned.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE]')
    
    // Normalize punctuation
    cleaned = cleaned.replace(/[""]/g, '"')
    cleaned = cleaned.replace(/['']/g, "'")
    
    return cleaned
  }

  private inferDocumentType(content: string, metadata: Partial<KnowledgeDocument['metadata']>): KnowledgeDocument['type'] {
    const contentLower = content.toLowerCase()
    
    // Pattern matching for document type inference
    if (contentLower.includes('safety') || contentLower.includes('warning') || contentLower.includes('emergency')) {
      return 'safety_guideline'
    } else if (contentLower.includes('pattern') || contentLower.includes('trend') || contentLower.includes('climate')) {
      return 'weather_pattern'
    } else if (contentLower.includes('event') || contentLower.includes('hurricane') || contentLower.includes('storm')) {
      return 'historical_event'
    } else if (contentLower.includes('data') || contentLower.includes('statistic') || contentLower.includes('analysis')) {
      return 'climate_data'
    } else if (contentLower.includes('user') || contentLower.includes('feedback') || contentLower.includes('experience')) {
      return 'user_feedback'
    }
    
    return 'weather_pattern' // Default type
  }

  private extractKeyInformation(content: string, documentType: KnowledgeDocument['type']): {
    weatherVariables: string[]
    eventTypes: string[]
    tags: string[]
  } {
    const contentLower = content.toLowerCase()
    
    // Extract weather variables
    const weatherVariables: string[] = []
    const weatherPatterns = [
      'precipitation', 'rain', 'snow', 'temperature', 'humidity', 'wind', 'pressure',
      'solar radiation', 'visibility', 'fog', 'cloud', 'thunderstorm', 'lightning'
    ]
    
    weatherPatterns.forEach(pattern => {
      if (contentLower.includes(pattern)) {
        weatherVariables.push(pattern)
      }
    })
    
    // Extract event types
    const eventTypes: string[] = []
    const eventPatterns = [
      'outdoor event', 'concert', 'sports', 'wedding', 'festival', 'construction',
      'agriculture', 'farming', 'aviation', 'maritime', 'emergency'
    ]
    
    eventPatterns.forEach(pattern => {
      if (contentLower.includes(pattern)) {
        eventTypes.push(pattern)
      }
    })
    
    // Generate contextual tags
    const tags: string[] = []
    
    if (contentLower.includes('forecast')) tags.push('forecast')
    if (contentLower.includes('historical')) tags.push('historical')
    if (contentLower.includes('extreme')) tags.push('extreme')
    if (contentLower.includes('seasonal')) tags.push('seasonal')
    if (contentLower.includes('regional')) tags.push('regional')
    if (contentLower.includes('nasa')) tags.push('nasa')
    if (contentLower.includes('satellite')) tags.push('satellite')
    
    return { weatherVariables, eventTypes, tags }
  }

  private generateTitle(chunk: string, metadata: Partial<KnowledgeDocument['metadata']>, index: number): string {
    // Extract first meaningful sentence as title
    const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length > 0) {
      let title = sentences[0].trim()
      
      // Limit title length
      if (title.length > 80) {
        title = title.substring(0, 77) + '...'
      }
      
      return title
    }
    
    // Fallback title
    const source = metadata.source || 'Document'
    return `${source} - Part ${index + 1}`
  }

  private calculateConfidenceScore(chunk: string, metadata: Partial<KnowledgeDocument['metadata']>): number {
    let score = 0.5 // Base score
    
    // Increase score for structured content
    if (chunk.includes('°C') || chunk.includes('°F') || chunk.includes('mm') || chunk.includes('%')) {
      score += 0.2 // Contains measurements
    }
    
    // Increase score for authoritative sources
    if (metadata.source?.toLowerCase().includes('nasa') || 
        metadata.source?.toLowerCase().includes('noaa') ||
        metadata.source?.toLowerCase().includes('nws')) {
      score += 0.3
    }
    
    // Increase score for recent content
    if (metadata.temporal?.date) {
      const contentDate = new Date(metadata.temporal.date)
      const ageYears = (Date.now() - contentDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
      if (ageYears < 1) score += 0.2
      else if (ageYears < 5) score += 0.1
    }
    
    // Decrease score for very short content
    if (chunk.length < 100) {
      score -= 0.2
    }
    
    return Math.max(0.1, Math.min(1.0, score))
  }
}

/**
 * Knowledge Management System - Main orchestration class
 */
export class KnowledgeManager {
  private vectorDb: VectorDatabase
  private embeddingService: EmbeddingService
  private documentProcessor: DocumentProcessor
  private knowledgeStats: KnowledgeStats

  constructor(
    vectorDb: VectorDatabase,
    embeddingService: EmbeddingService,
    documentProcessor?: DocumentProcessor
  ) {
    this.vectorDb = vectorDb
    this.embeddingService = embeddingService
    this.documentProcessor = documentProcessor || new WeatherDocumentProcessor()
    this.knowledgeStats = this.initializeStats()
  }

  async initialize(): Promise<void> {
    console.log('Initializing Knowledge Management System...')
    
    await this.vectorDb.initialize()
    await this.vectorDb.createIndex()
    
    console.log('✅ Knowledge Management System initialized')
  }

  async ingestDocument(rawContent: string, metadata: Partial<KnowledgeDocument['metadata']>): Promise<IngestionResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Process the document into chunks
      console.log(`Processing document: ${metadata.source || 'Unknown'}`)
      const documents = await this.documentProcessor.processDocument(rawContent, metadata)
      
      if (documents.length === 0) {
        return {
          success: false,
          documents_processed: 1,
          documents_created: 0,
          chunks_created: 0,
          processing_time_ms: Date.now() - startTime,
          errors: ['No processable content found in document']
        }
      }
      
      // Generate embeddings for all documents
      console.log(`Generating embeddings for ${documents.length} document chunks`)
      const texts = documents.map(doc => `${doc.title}\n\n${doc.content}`)
      const embeddingResult = await this.embeddingService.embedTexts(texts)
      
      // Add embeddings to documents
      documents.forEach((doc, index) => {
        doc.embedding = embeddingResult.embeddings[index]
      })
      
      // Store in vector database
      console.log(`Storing ${documents.length} documents in vector database`)
      await this.vectorDb.upsertDocuments(documents)
      
      // Update statistics
      this.updateStats(documents)
      
      const processingTime = Date.now() - startTime
      
      console.log(`✅ Document ingestion completed in ${processingTime}ms`)
      
      return {
        success: true,
        documents_processed: 1,
        documents_created: documents.length,
        chunks_created: documents.length,
        processing_time_ms: processingTime,
        warnings: warnings.length > 0 ? warnings : undefined
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during ingestion'
      errors.push(errorMessage)
      
      return {
        success: false,
        documents_processed: 1,
        documents_created: 0,
        chunks_created: 0,
        processing_time_ms: Date.now() - startTime,
        errors
      }
    }
  }

  async ingestDocuments(documents: Array<{ content: string; metadata: Partial<KnowledgeDocument['metadata']> }>): Promise<IngestionResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    let totalDocumentsCreated = 0
    let totalChunksCreated = 0
    
    console.log(`Starting batch ingestion of ${documents.length} documents`)
    
    for (let i = 0; i < documents.length; i++) {
      try {
        console.log(`Processing document ${i + 1}/${documents.length}`)
        const result = await this.ingestDocument(documents[i].content, documents[i].metadata)
        
        totalDocumentsCreated += result.documents_created
        totalChunksCreated += result.chunks_created
        
        if (result.errors) {
          errors.push(...result.errors)
        }
        if (result.warnings) {
          warnings.push(...result.warnings)
        }
        
      } catch (error) {
        const errorMessage = `Document ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMessage)
      }
    }
    
    const processingTime = Date.now() - startTime
    
    return {
      success: errors.length < documents.length, // Success if at least some documents processed
      documents_processed: documents.length,
      documents_created: totalDocumentsCreated,
      chunks_created: totalChunksCreated,
      processing_time_ms: processingTime,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  async getKnowledgeStats(): Promise<KnowledgeStats> {
    const dbStats = await this.vectorDb.getStats()
    
    this.knowledgeStats.total_documents = dbStats.total_documents
    this.knowledgeStats.storage_size_mb = dbStats.index_size_mb
    this.knowledgeStats.last_updated = dbStats.last_updated
    
    return { ...this.knowledgeStats }
  }

  async deleteDocuments(documentIds: string[]): Promise<void> {
    console.log(`Deleting ${documentIds.length} documents from knowledge base`)
    await this.vectorDb.deleteDocuments(documentIds)
    console.log('✅ Documents deleted successfully')
  }

  private initializeStats(): KnowledgeStats {
    return {
      total_documents: 0,
      documents_by_type: {},
      documents_by_source: {},
      average_document_length: 0,
      total_embeddings: 0,
      last_updated: new Date().toISOString(),
      storage_size_mb: 0
    }
  }

  private updateStats(documents: KnowledgeDocument[]): void {
    documents.forEach(doc => {
      // Update type counts
      this.knowledgeStats.documents_by_type[doc.type] = 
        (this.knowledgeStats.documents_by_type[doc.type] || 0) + 1
      
      // Update source counts
      this.knowledgeStats.documents_by_source[doc.metadata.source] = 
        (this.knowledgeStats.documents_by_source[doc.metadata.source] || 0) + 1
      
      // Update total embeddings
      this.knowledgeStats.total_embeddings += 1
    })
    
    // Update average document length
    const totalLength = documents.reduce((sum, doc) => sum + doc.content.length, 0)
    const currentTotal = this.knowledgeStats.total_documents * this.knowledgeStats.average_document_length
    this.knowledgeStats.average_document_length = 
      (currentTotal + totalLength) / (this.knowledgeStats.total_documents + documents.length)
    
    this.knowledgeStats.last_updated = new Date().toISOString()
  }
}
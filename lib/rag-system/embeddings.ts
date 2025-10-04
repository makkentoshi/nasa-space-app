/**
 * Embedding Service
 * 
 * Handles text-to-vector embedding generation for the RAG system
 * using various embedding models and providers.
 */

import { EmbeddingConfig } from './config'

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>
  getDimensions(): number
  getModel(): string
}

export interface EmbeddingResult {
  text: string
  embedding: number[]
  model: string
  dimensions: number
  processing_time_ms: number
}

export interface BatchEmbeddingResult {
  texts: string[]
  embeddings: number[][]
  model: string
  dimensions: number
  total_processing_time_ms: number
  average_time_per_text_ms: number
}

/**
 * OpenAI Embedding Provider
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private config: EmbeddingConfig
  private apiKey: string

  constructor(config: EmbeddingConfig) {
    this.config = config
    this.apiKey = config.api_key || process.env.OPENAI_API_KEY || ''
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required for OpenAI embedding provider')
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    console.log(`Generating OpenAI embedding for text (${text.length} chars)`)
    
    // Mock OpenAI API call
    // In real implementation:
    // const response = await fetch('https://api.openai.com/v1/embeddings', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     input: text,
    //     model: this.config.model_name
    //   })
    // })
    // 
    // const data = await response.json()
    // return data.data[0].embedding
    
    // Generate mock embedding vector
    const mockEmbedding = this.generateMockEmbedding(text)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    
    return mockEmbedding
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Generating OpenAI batch embeddings for ${texts.length} texts`)
    
    // Mock batch API call
    // In real implementation:
    // const response = await fetch('https://api.openai.com/v1/embeddings', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     input: texts,
    //     model: this.config.model_name
    //   })
    // })
    // 
    // const data = await response.json()
    // return data.data.map(item => item.embedding)
    
    // Process in batches to respect rate limits
    const batchSize = this.config.batch_size
    const results: number[][] = []
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchEmbeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      )
      results.push(...batchEmbeddings)
      
      // Rate limiting delay between batches
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  getDimensions(): number {
    return this.config.dimensions
  }

  getModel(): string {
    return this.config.model_name
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate deterministic mock embedding based on text content
    const embedding: number[] = []
    const textHash = this.simpleHash(text)
    
    for (let i = 0; i < this.config.dimensions; i++) {
      // Use text content and position to generate pseudo-random but deterministic values
      const seed = textHash + i
      const value = (Math.sin(seed) + Math.cos(seed * 0.7) + Math.sin(seed * 1.3)) / 3
      embedding.push(value)
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

/**
 * Hugging Face Embedding Provider
 */
export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  private config: EmbeddingConfig
  private apiKey: string

  constructor(config: EmbeddingConfig) {
    this.config = config
    this.apiKey = config.api_key || process.env.HUGGINGFACE_API_KEY || ''
  }

  async generateEmbedding(text: string): Promise<number[]> {
    console.log(`Generating Hugging Face embedding for text (${text.length} chars)`)
    
    // Mock Hugging Face API call
    // In real implementation:
    // const response = await fetch(
    //   `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.config.model_name}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${this.apiKey}`,
    //       'Content-Type': 'application/json'
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({ inputs: text })
    //   }
    // )
    // 
    // const embedding = await response.json()
    // return embedding
    
    // Generate mock embedding
    const mockEmbedding = this.generateMockEmbedding(text)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
    
    return mockEmbedding
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Generating Hugging Face batch embeddings for ${texts.length} texts`)
    
    // Process texts individually for Hugging Face (no batch API)
    const results: number[][] = []
    
    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i])
      results.push(embedding)
      
      // Rate limiting delay
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return results
  }

  getDimensions(): number {
    return this.config.dimensions
  }

  getModel(): string {
    return this.config.model_name
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate smaller dimensional embedding for Hugging Face models
    const embedding: number[] = []
    const textHash = this.simpleHash(text)
    
    for (let i = 0; i < this.config.dimensions; i++) {
      const seed = textHash + i * 13
      const value = Math.tanh((Math.sin(seed * 0.1) + Math.cos(seed * 0.3)) * 2)
      embedding.push(value)
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
}

/**
 * Sentence Transformers (Local) Embedding Provider
 */
export class SentenceTransformersProvider implements EmbeddingProvider {
  private config: EmbeddingConfig
  private model: any // SentenceTransformer model would be loaded here

  constructor(config: EmbeddingConfig) {
    this.config = config
  }

  async generateEmbedding(text: string): Promise<number[]> {
    console.log(`Generating Sentence Transformers embedding for text (${text.length} chars)`)
    
    // Mock local model inference
    // In real implementation:
    // const embedding = await this.model.encode([text])
    // return embedding[0]
    
    // Generate mock embedding
    const mockEmbedding = this.generateMockEmbedding(text)
    
    // Simulate local inference time (faster than API calls)
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 50))
    
    return mockEmbedding
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Generating Sentence Transformers batch embeddings for ${texts.length} texts`)
    
    // Mock batch processing (much faster for local models)
    // In real implementation:
    // return await this.model.encode(texts)
    
    const results = await Promise.all(
      texts.map(text => this.generateEmbedding(text))
    )
    
    return results
  }

  getDimensions(): number {
    return this.config.dimensions
  }

  getModel(): string {
    return this.config.model_name
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate compact embedding for sentence transformers
    const embedding: number[] = []
    const textHash = this.simpleHash(text)
    
    for (let i = 0; i < this.config.dimensions; i++) {
      const seed = textHash + i * 7
      const value = Math.tanh(Math.sin(seed * 0.05) * 1.5)
      embedding.push(value)
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
}

/**
 * Embedding Service - Main class for text embedding operations
 */
export class EmbeddingService {
  private provider: EmbeddingProvider
  private config: EmbeddingConfig

  constructor(config: EmbeddingConfig) {
    this.config = config
    this.provider = this.createProvider(config)
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now()
    
    // Truncate text if it exceeds max tokens
    const truncatedText = this.truncateText(text, this.config.max_tokens)
    
    const embedding = await this.provider.generateEmbedding(truncatedText)
    const processingTime = Date.now() - startTime
    
    return {
      text: truncatedText,
      embedding,
      model: this.provider.getModel(),
      dimensions: this.provider.getDimensions(),
      processing_time_ms: processingTime
    }
  }

  async embedTexts(texts: string[]): Promise<BatchEmbeddingResult> {
    const startTime = Date.now()
    
    // Truncate all texts
    const truncatedTexts = texts.map(text => 
      this.truncateText(text, this.config.max_tokens)
    )
    
    const embeddings = await this.provider.generateBatchEmbeddings(truncatedTexts)
    const totalTime = Date.now() - startTime
    
    return {
      texts: truncatedTexts,
      embeddings,
      model: this.provider.getModel(),
      dimensions: this.provider.getDimensions(),
      total_processing_time_ms: totalTime,
      average_time_per_text_ms: totalTime / texts.length
    }
  }

  private createProvider(config: EmbeddingConfig): EmbeddingProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIEmbeddingProvider(config)
      case 'huggingface':
        return new HuggingFaceEmbeddingProvider(config)
      case 'sentence_transformers':
        return new SentenceTransformersProvider(config)
      default:
        throw new Error(`Unsupported embedding provider: ${config.provider}`)
    }
  }

  private truncateText(text: string, maxTokens: number): string {
    // Simple approximation: ~4 characters per token
    const maxChars = maxTokens * 4
    
    if (text.length <= maxChars) {
      return text
    }
    
    // Truncate at word boundary
    const truncated = text.substring(0, maxChars)
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    
    return lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated
  }
}
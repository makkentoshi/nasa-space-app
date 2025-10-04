/**
 * RAG Vector Database Configuration
 * 
 * Configuration for the Retrieval-Augmented Generation system that powers
 * AI recommendations in the resQ Forecast Mode.
 */

export interface VectorDatabaseConfig {
  provider: 'pinecone' | 'weaviate' | 'local_faiss'
  api_key?: string
  api_url?: string
  index_name: string
  dimensions: number
  distance_metric: 'cosine' | 'euclidean' | 'dot_product'
  shard_replicas?: number
  environment?: string
}

export interface EmbeddingConfig {
  provider: 'openai' | 'huggingface' | 'sentence_transformers'
  model_name: string
  api_key?: string
  batch_size: number
  max_tokens: number
  dimensions: number
}

export interface RAGConfig {
  vector_db: VectorDatabaseConfig
  embedding: EmbeddingConfig
  retrieval: {
    top_k: number
    similarity_threshold: number
    enable_reranking: boolean
    reranker_model?: string
  }
  chunking: {
    strategy: 'semantic' | 'fixed_size' | 'overlap'
    chunk_size: number
    overlap_size: number
    min_chunk_size: number
  }
  indexing: {
    batch_size: number
    update_frequency: 'real_time' | 'hourly' | 'daily'
    include_metadata: boolean
    auto_cleanup: boolean
  }
}

// Knowledge base document types
export interface KnowledgeDocument {
  id: string
  type: 'weather_pattern' | 'historical_event' | 'climate_data' | 'safety_guideline' | 'user_feedback'
  title: string
  content: string
  metadata: {
    source: string
    location?: {
      lat: number
      lon: number
      region?: string
      country?: string
    }
    temporal?: {
      date?: string
      season?: 'spring' | 'summer' | 'fall' | 'winter'
      time_period?: string
    }
    weather_variables?: string[]
    event_types?: string[]
    confidence_score?: number
    last_updated: string
    tags: string[]
    language: string
  }
  embedding?: number[]
}

// Retrieval context for AI recommendations
export interface RetrievalContext {
  query: string
  location: {
    lat: number
    lon: number
    region?: string
  }
  temporal: {
    date: string
    season?: string
    time_of_day?: string
  }
  weather_context: {
    current_conditions?: any
    forecast_data?: any
    historical_patterns?: any
  }
  user_context?: {
    event_type: string
    risk_tolerance: 'low' | 'medium' | 'high'
    preferences: string[]
    past_events?: any[]
  }
  filters?: {
    document_types?: string[]
    date_range?: { start: string; end: string }
    confidence_threshold?: number
    regions?: string[]
  }
}

// Default configurations for different deployment scenarios
export const DEFAULT_PRODUCTION_CONFIG: RAGConfig = {
  vector_db: {
    provider: 'pinecone',
    index_name: 'resq-forecast-knowledge',
    dimensions: 1536, // OpenAI text-embedding-3-small
    distance_metric: 'cosine',
    shard_replicas: 2,
    environment: 'production'
  },
  embedding: {
    provider: 'openai',
    model_name: 'text-embedding-3-small',
    batch_size: 100,
    max_tokens: 8191,
    dimensions: 1536
  },
  retrieval: {
    top_k: 10,
    similarity_threshold: 0.7,
    enable_reranking: true,
    reranker_model: 'cross-encoder/ms-marco-MiniLM-L-6-v2'
  },
  chunking: {
    strategy: 'semantic',
    chunk_size: 512,
    overlap_size: 64,
    min_chunk_size: 100
  },
  indexing: {
    batch_size: 50,
    update_frequency: 'hourly',
    include_metadata: true,
    auto_cleanup: true
  }
}

export const DEFAULT_DEVELOPMENT_CONFIG: RAGConfig = {
  vector_db: {
    provider: 'local_faiss',
    index_name: 'resq-forecast-dev',
    dimensions: 384, // all-MiniLM-L6-v2
    distance_metric: 'cosine'
  },
  embedding: {
    provider: 'sentence_transformers',
    model_name: 'all-MiniLM-L6-v2',
    batch_size: 32,
    max_tokens: 512,
    dimensions: 384
  },
  retrieval: {
    top_k: 5,
    similarity_threshold: 0.6,
    enable_reranking: false
  },
  chunking: {
    strategy: 'fixed_size',
    chunk_size: 256,
    overlap_size: 32,
    min_chunk_size: 50
  },
  indexing: {
    batch_size: 20,
    update_frequency: 'daily',
    include_metadata: true,
    auto_cleanup: false
  }
}

// Pre-defined knowledge categories for the weather/climate domain
export const KNOWLEDGE_CATEGORIES = {
  WEATHER_PATTERNS: {
    id: 'weather_patterns',
    name: 'Weather Patterns',
    description: 'Meteorological phenomena and pattern recognition',
    subcategories: [
      'precipitation_patterns',
      'temperature_trends',
      'wind_patterns',
      'pressure_systems',
      'seasonal_variations'
    ]
  },
  HISTORICAL_EVENTS: {
    id: 'historical_events',
    name: 'Historical Weather Events',
    description: 'Past weather events and their impacts',
    subcategories: [
      'extreme_weather',
      'seasonal_anomalies',
      'climate_trends',
      'regional_patterns',
      'event_impacts'
    ]
  },
  SAFETY_GUIDELINES: {
    id: 'safety_guidelines',
    name: 'Weather Safety Guidelines',
    description: 'Safety recommendations for various weather conditions',
    subcategories: [
      'severe_weather_safety',
      'outdoor_activity_guidelines',
      'emergency_preparedness',
      'risk_mitigation',
      'evacuation_procedures'
    ]
  },
  CLIMATE_DATA: {
    id: 'climate_data',
    name: 'Climate Data Insights',
    description: 'Statistical insights from climate datasets',
    subcategories: [
      'nasa_dataset_patterns',
      'statistical_trends',
      'forecast_accuracy',
      'data_quality_notes',
      'regional_variations'
    ]
  },
  USER_EXPERIENCES: {
    id: 'user_experiences',
    name: 'User Experiences and Feedback',
    description: 'Real user experiences and event outcomes',
    subcategories: [
      'event_planning_outcomes',
      'forecast_accuracy_feedback',
      'user_adaptations',
      'lessons_learned',
      'best_practices'
    ]
  }
} as const

// Vector similarity search result
export interface VectorSearchResult {
  document: KnowledgeDocument
  score: number
  rank: number
  explanation?: string
}

// RAG retrieval result with context
export interface RAGRetrievalResult {
  query: string
  context_summary: string
  retrieved_documents: VectorSearchResult[]
  total_matches: number
  retrieval_time_ms: number
  metadata: {
    embedding_time_ms: number
    search_time_ms: number
    reranking_time_ms?: number
    filters_applied: string[]
    similarity_threshold: number
  }
  suggestions?: {
    related_queries: string[]
    missing_context: string[]
    confidence_level: 'high' | 'medium' | 'low'
  }
}
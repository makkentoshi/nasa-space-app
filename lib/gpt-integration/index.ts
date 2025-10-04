/**
 * GPT-5 Integration for Weather Recommendations
 * 
 * Integrates OpenAI's GPT-5 model with the RAG system to generate
 * intelligent, context-aware weather recommendations and advice.
 */

export interface GPTConfig {
  api_key: string
  model: string
  temperature: number
  max_tokens: number
  timeout_ms: number
}

export interface WeatherPromptTemplate {
  system_prompt: string
  user_prompt_template: string
  context_template: string
  output_format: string
}

export interface GPTRequest {
  query: string
  context: string
  location?: {
    name: string
    latitude: number
    longitude: number
  }
  weather_data?: {
    current?: any
    forecast?: any
    nasa_data?: any
  }
  event_context?: {
    event_type: string
    start_time: string
    duration_hours?: number
    participants?: number
    outdoor?: boolean
  }
  user_preferences?: {
    risk_tolerance: 'low' | 'medium' | 'high'
    communication_style: 'technical' | 'casual' | 'detailed'
    focus_areas: string[]
  }
}

export interface GPTResponse {
  recommendation: string
  confidence: number
  reasoning: string
  alternative_scenarios?: string[]
  follow_up_questions?: string[]
  sources_used: string[]
  model_info: {
    model: string
    temperature: number
    tokens_used: number
    processing_time_ms: number
  }
}

/**
 * Weather-specific prompt templates for different scenarios
 */
export class WeatherPromptTemplates {
  
  static getSystemPrompt(): string {
    return `You are an expert weather advisor and risk assessment specialist with deep knowledge of meteorology, event planning, and safety protocols. Your role is to provide accurate, actionable weather recommendations based on scientific data and established safety guidelines.

Key Responsibilities:
- Analyze weather conditions and patterns for potential risks and opportunities
- Provide specific, actionable advice tailored to the user's event or activity
- Assess risk levels using established meteorological and safety standards
- Recommend timing adjustments, contingency plans, and safety measures
- Communicate complex weather information in accessible, practical terms

Guidelines:
- Always prioritize safety over convenience
- Provide specific numeric thresholds and timing recommendations when possible
- Include both immediate and alternative options
- Reference authoritative sources (NOAA, NWS, CDC) when applicable
- Acknowledge uncertainty levels and provide confidence assessments
- Tailor communication style to user preferences and technical background

Context Understanding:
- You have access to real-time weather data, forecasts, and historical patterns
- You can reference NASA Earth Science data and climate models
- You understand local geography, seasonal patterns, and regional weather phenomena
- You know safety standards for various event types and outdoor activities`
  }

  static getUserPromptTemplate(): string {
    return `Please provide a comprehensive weather recommendation for the following situation:

USER QUERY: {query}

LOCATION: {location_name} ({latitude}, {longitude})

EVENT/ACTIVITY DETAILS:
- Type: {event_type}
- Start Time: {start_time}
- Duration: {duration_hours} hours
- Outdoor: {outdoor}
- Participants: {participants}

CURRENT CONDITIONS:
{current_weather}

FORECAST DATA:
{forecast_data}

RISK TOLERANCE: {risk_tolerance}
COMMUNICATION STYLE: {communication_style}

RELEVANT WEATHER KNOWLEDGE:
{context}

Please structure your response with:
1. RECOMMENDATION SUMMARY (2-3 sentences)
2. RISK ASSESSMENT (specific risks and likelihood)
3. ACTIONABLE ADVICE (numbered list of specific actions)
4. TIMING RECOMMENDATIONS (optimal windows and periods to avoid)
5. CONTINGENCY OPTIONS (backup plans and alternatives)
6. CONFIDENCE LEVEL (high/medium/low with reasoning)

Focus on practical, implementable advice that considers both weather science and real-world constraints.`
  }

  static getContextTemplate(): string {
    return `=== WEATHER KNOWLEDGE CONTEXT ===

The following information has been retrieved from authoritative weather and safety sources to inform this recommendation:

{retrieved_context}

=== ADDITIONAL CONSIDERATIONS ===

Based on the query and location, consider:
- Local weather patterns and seasonal trends
- Geographic factors (elevation, proximity to water, urban heat effects)
- Event-specific weather sensitivities and requirements
- Historical weather events and lessons learned
- Current atmospheric conditions and short-term forecast trends

Use this context to provide evidence-based recommendations while acknowledging any limitations or uncertainties in the available data.`
  }

  static getOutputFormat(): string {
    return `Return a valid JSON response with the following structure:

{
  "recommendation": "Brief 2-3 sentence summary recommendation",
  "confidence": 0.85,
  "reasoning": "Detailed explanation of the weather analysis and decision factors",
  "risk_assessment": {
    "overall_risk": "low|medium|high",
    "specific_risks": ["list of identified weather risks"],
    "risk_likelihood": {"risk_name": "probability_description"},
    "severity_if_occurs": {"risk_name": "impact_description"}
  },
  "actionable_advice": [
    "Specific action item 1",
    "Specific action item 2"
  ],
  "timing_recommendations": {
    "optimal_windows": ["time periods with best conditions"],
    "avoid_windows": ["time periods with higher risks"],
    "monitoring_points": ["key times to reassess conditions"]
  },
  "contingency_options": [
    "Alternative plan 1",
    "Alternative plan 2"
  ],
  "alternative_scenarios": [
    "If conditions worsen: ...",
    "If conditions improve: ..."
  ],
  "follow_up_questions": [
    "Question to clarify requirements",
    "Question about backup plans"
  ],
  "data_confidence": {
    "forecast_reliability": "high|medium|low",
    "local_knowledge": "excellent|good|limited",
    "recommendation_certainty": "high|medium|low"
  }
}`
  }
}

/**
 * GPT-5 Response Parser
 */
export class GPTResponseParser {
  
  static parseWeatherRecommendation(response: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback: parse structured text response
      return this.parseStructuredText(response)
      
    } catch (error) {
      console.warn('Failed to parse GPT response as JSON, using text parsing:', error)
      return this.parseStructuredText(response)
    }
  }

  private static parseStructuredText(response: string): any {
    const sections = this.extractSections(response)
    
    return {
      recommendation: sections['RECOMMENDATION SUMMARY'] || sections['SUMMARY'] || 'Unable to parse recommendation',
      confidence: this.extractConfidence(response),
      reasoning: sections['RISK ASSESSMENT'] || sections['ANALYSIS'] || '',
      risk_assessment: this.parseRiskAssessment(sections),
      actionable_advice: this.parseList(sections['ACTIONABLE ADVICE'] || sections['ACTIONS'] || ''),
      timing_recommendations: this.parseTimingRecommendations(sections),
      contingency_options: this.parseList(sections['CONTINGENCY OPTIONS'] || sections['ALTERNATIVES'] || ''),
      alternative_scenarios: this.parseAlternativeScenarios(response),
      follow_up_questions: this.extractQuestions(response),
      data_confidence: {
        forecast_reliability: 'medium',
        local_knowledge: 'good',
        recommendation_certainty: this.extractConfidence(response) > 0.7 ? 'high' : 'medium'
      }
    }
  }

  private static extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {}
    const sectionRegex = /(?:^|\n)((?:[A-Z][A-Z\s]+)|(?:\d+\.\s+[A-Z][A-Z\s]+))[\:\-]?\s*\n?(.*?)(?=\n(?:[A-Z][A-Z\s]+|\d+\.\s+[A-Z])|$)/gm
    
    let match
    while ((match = sectionRegex.exec(text)) !== null) {
      const title = match[1].trim().replace(/^\d+\.\s*/, '').replace(/[\:\-]+$/, '')
      const content = match[2].trim()
      sections[title] = content
    }
    
    return sections
  }

  private static extractConfidence(text: string): number {
    // Look for confidence indicators
    const confidenceRegex = /confidence[:\s]+([0-9]+)%|confidence[:\s]+([0-9.]+)|confidence[:\s]+(high|medium|low)/gi
    const match = confidenceRegex.exec(text)
    
    if (match) {
      if (match[1]) return parseInt(match[1]) / 100
      if (match[2]) return parseFloat(match[2])
      if (match[3]) {
        const level = match[3].toLowerCase()
        return level === 'high' ? 0.85 : level === 'medium' ? 0.65 : 0.45
      }
    }
    
    // Default confidence based on text indicators
    if (text.toLowerCase().includes('highly confident') || text.toLowerCase().includes('very likely')) {
      return 0.85
    } else if (text.toLowerCase().includes('uncertain') || text.toLowerCase().includes('unclear')) {
      return 0.45
    }
    
    return 0.65 // Default medium confidence
  }

  private static parseRiskAssessment(sections: Record<string, string>): any {
    const riskSection = sections['RISK ASSESSMENT'] || sections['RISKS'] || ''
    
    const risks: string[] = []
    const riskRegex = /[-•*]\s*([^-•*\n]+)/g
    let match
    while ((match = riskRegex.exec(riskSection)) !== null) {
      risks.push(match[1].trim())
    }
    
    // Determine overall risk level
    let overallRisk = 'low'
    if (riskSection.toLowerCase().includes('high risk') || riskSection.toLowerCase().includes('dangerous')) {
      overallRisk = 'high'
    } else if (riskSection.toLowerCase().includes('moderate risk') || riskSection.toLowerCase().includes('caution')) {
      overallRisk = 'medium'
    }
    
    return {
      overall_risk: overallRisk,
      specific_risks: risks,
      risk_likelihood: {},
      severity_if_occurs: {}
    }
  }

  private static parseList(text: string): string[] {
    if (!text) return []
    
    const items: string[] = []
    const itemRegex = /(?:^|\n)(?:\d+\.\s*|[-•*]\s*)([^-•*\n]+)/g
    
    let match
    while ((match = itemRegex.exec(text)) !== null) {
      const item = match[1].trim()
      if (item.length > 5) { // Filter out very short items
        items.push(item)
      }
    }
    
    return items
  }

  private static parseTimingRecommendations(sections: Record<string, string>): any {
    const timingSection = sections['TIMING RECOMMENDATIONS'] || sections['TIMING'] || ''
    
    return {
      optimal_windows: this.extractTimeWindows(timingSection, ['optimal', 'best', 'recommended']),
      avoid_windows: this.extractTimeWindows(timingSection, ['avoid', 'risky', 'dangerous']),
      monitoring_points: this.extractTimeWindows(timingSection, ['monitor', 'check', 'reassess'])
    }
  }

  private static extractTimeWindows(text: string, keywords: string[]): string[] {
    const windows: string[] = []
    
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[^.]*?([0-9]{1,2}[:\\s]*[0-9]{0,2}\\s*(?:AM|PM|am|pm)?[^.]*?)`, 'gi')
      const matches = text.match(regex)
      
      if (matches) {
        windows.push(...matches.map(m => m.trim()))
      }
    }
    
    return windows
  }

  private static parseAlternativeScenarios(text: string): string[] {
    const scenarios: string[] = []
    const scenarioRegex = /(?:if|should|when)\s+([^.!?]+[.!?])/gi
    
    let match
    while ((match = scenarioRegex.exec(text)) !== null) {
      scenarios.push(match[0].trim())
    }
    
    return scenarios.slice(0, 3) // Limit to 3 scenarios
  }

  private static extractQuestions(text: string): string[] {
    const questions: string[] = []
    const questionRegex = /([^.!?]*\?)/g
    
    let match
    while ((match = questionRegex.exec(text)) !== null) {
      const question = match[1].trim()
      if (question.length > 10) { // Filter out very short questions
        questions.push(question)
      }
    }
    
    return questions.slice(0, 3) // Limit to 3 questions
  }
}

/**
 * Main GPT-5 Integration Service
 */
export class WeatherGPTService {
  private config: GPTConfig
  private promptTemplates: WeatherPromptTemplates

  constructor(config: GPTConfig) {
    this.config = config
    this.promptTemplates = new WeatherPromptTemplates()
  }

  async generateRecommendation(request: GPTRequest): Promise<GPTResponse> {
    const startTime = Date.now()
    
    console.log(`🤖 Generating GPT recommendation for: "${request.query}"`)
    
    try {
      // Build the complete prompt
      const prompt = this.buildPrompt(request)
      
      // Make API call to OpenAI
      const apiResponse = await this.callOpenAI(prompt)
      
      // Parse the response
      const parsedResponse = GPTResponseParser.parseWeatherRecommendation(apiResponse.content)
      
      const processingTime = Date.now() - startTime
      
      const gptResponse: GPTResponse = {
        recommendation: parsedResponse.recommendation || 'Unable to generate recommendation',
        confidence: parsedResponse.confidence || parsedResponse.data_confidence?.recommendation_certainty === 'high' ? 0.85 : 0.65,
        reasoning: parsedResponse.reasoning || parsedResponse.risk_assessment || '',
        alternative_scenarios: parsedResponse.alternative_scenarios || [],
        follow_up_questions: parsedResponse.follow_up_questions || [],
        sources_used: this.extractSourcesFromContext(request.context),
        model_info: {
          model: this.config.model,
          temperature: this.config.temperature,
          tokens_used: apiResponse.usage?.total_tokens || 0,
          processing_time_ms: processingTime
        }
      }
      
      console.log(`✅ GPT recommendation generated in ${processingTime}ms`)
      
      return gptResponse
      
    } catch (error) {
      console.error('❌ Failed to generate GPT recommendation:', error)
      throw new Error(`GPT service error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildPrompt(request: GPTRequest): string {
    const systemPrompt = WeatherPromptTemplates.getSystemPrompt()
    
    // Build user prompt with template substitution
    let userPrompt = WeatherPromptTemplates.getUserPromptTemplate()
    
    // Replace template variables
    userPrompt = userPrompt
      .replace('{query}', request.query)
      .replace('{location_name}', request.location?.name || 'Unknown location')
      .replace('{latitude}', request.location?.latitude?.toString() || 'N/A')
      .replace('{longitude}', request.location?.longitude?.toString() || 'N/A')
      .replace('{event_type}', request.event_context?.event_type || 'General activity')
      .replace('{start_time}', request.event_context?.start_time || 'Not specified')
      .replace('{duration_hours}', request.event_context?.duration_hours?.toString() || 'Not specified')
      .replace('{outdoor}', request.event_context?.outdoor ? 'Yes' : 'No')
      .replace('{participants}', request.event_context?.participants?.toString() || 'Not specified')
      .replace('{current_weather}', this.formatWeatherData(request.weather_data?.current))
      .replace('{forecast_data}', this.formatWeatherData(request.weather_data?.forecast))
      .replace('{risk_tolerance}', request.user_preferences?.risk_tolerance || 'medium')
      .replace('{communication_style}', request.user_preferences?.communication_style || 'detailed')
      .replace('{context}', request.context || 'No additional context available')
    
    // Build context section
    const contextPrompt = WeatherPromptTemplates.getContextTemplate()
      .replace('{retrieved_context}', request.context || 'No relevant context found')
    
    return `${systemPrompt}\n\n${contextPrompt}\n\n${userPrompt}\n\n${WeatherPromptTemplates.getOutputFormat()}`
  }

  private formatWeatherData(weatherData: any): string {
    if (!weatherData) return 'No weather data available'
    
    const formatted: string[] = []
    
    if (weatherData.temperature !== undefined) {
      formatted.push(`Temperature: ${weatherData.temperature}°F`)
    }
    if (weatherData.humidity !== undefined) {
      formatted.push(`Humidity: ${weatherData.humidity}%`)
    }
    if (weatherData.wind_speed !== undefined) {
      formatted.push(`Wind Speed: ${weatherData.wind_speed} mph`)
    }
    if (weatherData.precipitation_probability !== undefined) {
      formatted.push(`Precipitation Probability: ${weatherData.precipitation_probability}%`)
    }
    if (weatherData.conditions && Array.isArray(weatherData.conditions)) {
      formatted.push(`Conditions: ${weatherData.conditions.join(', ')}`)
    }
    
    return formatted.length > 0 ? formatted.join('\n') : 'Weather data format not recognized'
  }

  private async callOpenAI(prompt: string): Promise<any> {
    const requestBody = {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
      response_format: { type: 'text' } // Allow both JSON and text responses
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout_ms)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated by OpenAI')
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage
    }
  }

  private extractSourcesFromContext(context: string): string[] {
    const sources = new Set<string>()
    
    // Extract sources from context using various patterns
    const sourcePatterns = [
      /Source:\s*([^\n\|]+)/gi,
      /\[([^\]]+)\]/gi,
      /(NOAA|NASA|NWS|CDC|National Weather Service)[^.]*\./gi
    ]
    
    sourcePatterns.forEach(pattern => {
      const matches = context.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/Source:\s*|\[|\]/g, '').trim()
          if (cleaned.length > 3) {
            sources.add(cleaned)
          }
        })
      }
    })
    
    return Array.from(sources)
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.callOpenAI('Test connection. Respond with "OK".')
      return testResponse.content.includes('OK')
    } catch (error) {
      console.error('GPT service connection test failed:', error)
      return false
    }
  }

  updateConfig(newConfig: Partial<GPTConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

/**
 * Factory function to create GPT service with default configuration
 */
export function createWeatherGPTService(apiKey: string, options?: Partial<GPTConfig>): WeatherGPTService {
  const defaultConfig: GPTConfig = {
    api_key: apiKey,
    model: 'gpt-4o', // Using GPT-4o as GPT-5 might not be available yet
    temperature: 0.3, // Lower temperature for more consistent recommendations
    max_tokens: 2000,
    timeout_ms: 30000
  }
  
  const config = { ...defaultConfig, ...options }
  
  return new WeatherGPTService(config)
}
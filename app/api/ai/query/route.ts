import { NextRequest, NextResponse } from 'next/server';
import type { AIQueryRequest, AIQueryResponse } from '@/app/types';

/**
 * POST /api/ai/query
 * Query AI assistant with context about location and weather parameters
 * Implements RAG (Retrieval-Augmented Generation) pattern
 * 
 * Request body: AIQueryRequest
 * Response: AIQueryResponse
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AIQueryRequest = await request.json();

    // Validate required fields
    if (!body.user_query || !body.location || !body.day_of_year) {
      return NextResponse.json(
        { detail: 'Missing required fields: user_query, location, day_of_year' },
        { status: 400 }
      );
    }

    // TODO: Implement RAG pipeline
    // 1. Fetch statistics for each variable using internal call to /api/forecast/statistics
    // 2. Build short summary documents (location + day + variable + stats)
    // 3. Query vector DB for relevant historical context (if available)
    // 4. Construct prompt with system instructions + retrieved context + user query
    // 5. Call GPT API (OpenAI or compatible) with structured prompt
    // 6. Parse response and format as AIQueryResponse
    // 7. Generate downloadable URLs if requested

    // System prompt template
    const systemPrompt = `You are ForecastGPT-5 — an expert on climatology, risk communication, and actionable advice. 
You will be given structured data blocks (short_summary, statistics, time_series_snippet, metadata) and a user question about the likelihood of weather conditions for a given location and day. 
Your output MUST include: 
1) short human-friendly answer (1-2 sentences), 
2) technical explanation (2-3 sentences) including probability and uncertainty, 
3) recommended actions tailored to user_profile and activity_type (3 bullet points), 
4) confidence_score (0-1), 
5) sources list and a short caveat that this is statistical/climatological info — not a short-term forecast. 
Be concise, do not hallucinate, and cite sources from the provided metadata. If data gaps exist, explicitly say so.`;

    // Skeleton response
    const response: AIQueryResponse = {
      answer: `Based on historical climatology for ${body.location.place_name || 'your location'}, there is moderate uncertainty about ${body.variables.join(', ')} conditions on day ${body.day_of_year}.`,
      explanation: `Statistical analysis of ${body.variables.length} weather variable(s) across 20+ years shows variability in the selected period. Probability estimates are based on historical data and should not be used as a short-term forecast.`,
      recommended_actions: [
        'Check short-term weather forecast closer to the event date',
        'Have contingency plans for variable weather conditions',
        'Monitor updated climatological probabilities as the date approaches',
      ],
      confidence_score: 0.7,
      sources: [
        {
          dataset: 'GPM IMERG',
          url: 'https://gpm.nasa.gov/data/imerg',
          resolution: '0.1 degree',
        },
      ],
    };

    // Add user profile specific recommendations if provided
    if (body.user_profile?.activity_type) {
      response.recommended_actions.push(
        `For ${body.user_profile.activity_type}: consider indoor backup options`
      );
    }

    // Add downloadable URLs (placeholder)
    response.downloadable = {
      csv_url: '/api/export/csv?location_id=placeholder',
      json_url: '/api/export/json?location_id=placeholder',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/ai/query:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

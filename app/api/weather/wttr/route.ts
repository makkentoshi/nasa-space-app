import { NextRequest, NextResponse } from 'next/server';

/**
 * Wttr.in Weather API Proxy
 * 
 * This endpoint proxies weather requests to wttr.in API
 * to avoid CORS issues when calling from the client/service worker.
 * 
 * Endpoint:
 * - /api/weather/wttr?lat=51.1694&lng=71.4491
 * - /api/weather/wttr?location=Astana
 */

const WTTR_BASE_URL = 'https://wttr.in';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location');

  try {
    let wttrUrl: string;

    // Use coordinates or location name
    if (lat && lng) {
      wttrUrl = `${WTTR_BASE_URL}/${lat},${lng}?format=j1`;
    } else if (location) {
      wttrUrl = `${WTTR_BASE_URL}/${encodeURIComponent(location)}?format=j1`;
    } else {
      return NextResponse.json(
        { error: 'Missing required parameters. Provide either lat & lng or location name.' },
        { status: 400 }
      );
    }

    // Fetch from wttr.in with proper headers
    const response = await fetch(wttrUrl, {
      headers: {
        'User-Agent': 'ResQ-Weather-App/1.0 (NASA Space Apps Challenge)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wttr.in API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Wttr.in error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data from wttr.in',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

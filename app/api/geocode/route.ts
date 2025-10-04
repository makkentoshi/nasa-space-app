import { NextRequest, NextResponse } from 'next/server';

/**
 * Geocode API Proxy
 * 
 * This endpoint proxies geocoding requests to OpenStreetMap Nominatim API
 * to avoid CORS issues when calling from the client/service worker.
 * 
 * Endpoints:
 * - /api/geocode/reverse?lat=51.1694&lng=71.4491
 * - /api/geocode/search?q=Astana
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const q = searchParams.get('q');

  try {
    let nominatimUrl: string;

    // Reverse geocoding (coordinates to address)
    if (lat && lng) {
      nominatimUrl = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    }
    // Forward geocoding (address to coordinates)
    else if (q) {
      nominatimUrl = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    }
    // Missing parameters
    else {
      return NextResponse.json(
        { error: 'Missing required parameters. Provide either lat & lng for reverse geocoding, or q for forward geocoding.' },
        { status: 400 }
      );
    }

    // Fetch from Nominatim with proper headers
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'ResQ-Weather-App/1.0 (NASA Space Apps Challenge)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
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
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch geocoding data',
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

import { NextRequest, NextResponse } from 'next/server';

/**
 * Weather API Endpoint
 * 
 * Fetches current weather data for a given location.
 * Can integrate with NASA POWER API or other weather services.
 * 
 * Query Parameters:
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 * 
 * Example: /api/weather?lat=51.1694&lng=71.4491
 */

interface WeatherResponse {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    condition: string;
    feelsLike?: number;
  };
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

// Helper to generate mock weather data
function generateMockWeather(lat: number, lng: number): WeatherResponse {
  // Add some variation based on location
  const tempVariation = Math.sin(lat * 0.1) * 5;
  const humidityVariation = Math.cos(lng * 0.1) * 10;
  
  const baseTemp = 20 + tempVariation;
  const baseHumidity = 60 + humidityVariation;
  
  return {
    current: {
      temperature: Math.round(baseTemp + Math.random() * 8 - 4),
      humidity: Math.max(30, Math.min(90, Math.round(baseHumidity + Math.random() * 20 - 10))),
      windSpeed: Math.round(8 + Math.random() * 12),
      precipitation: Math.round(Math.random() * 30),
      condition: ["sunny", "partly_cloudy", "cloudy", "rainy"][Math.floor(Math.random() * 4)],
      feelsLike: Math.round(baseTemp + Math.random() * 6 - 3),
    },
    location: { lat, lng },
    timestamp: new Date().toISOString(),
  };
}

// Fetch from NASA POWER API (production)
async function fetchNASAWeather(lat: number, lng: number): Promise<WeatherResponse | null> {
  try {
    // NASA POWER API endpoint
    // Note: This is for historical/climatology data, may not provide real-time current weather
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const startDate = yesterday.toISOString().split('T')[0].replace(/-/g, '');
    const endDate = today.toISOString().split('T')[0].replace(/-/g, '');
    
    const params = new URLSearchParams({
      parameters: 'T2M,RH2M,WS10M,PRECTOTCORR',
      community: 'RE',
      longitude: lng.toString(),
      latitude: lat.toString(),
      start: startDate,
      end: endDate,
      format: 'JSON'
    });
    
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('NASA POWER API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const properties = data.properties?.parameter;
    
    if (!properties) {
      return null;
    }
    
    // Get most recent data
    const dates = Object.keys(properties.T2M || {}).sort();
    const latestDate = dates[dates.length - 1];
    
    if (!latestDate) {
      return null;
    }
    
    const temp = properties.T2M?.[latestDate] ?? 20;
    const humidity = properties.RH2M?.[latestDate] ?? 60;
    const windSpeed = properties.WS10M?.[latestDate] ?? 10;
    const precipitation = properties.PRECTOTCORR?.[latestDate] ?? 0;
    
    // Determine condition based on precipitation and temperature
    let condition = 'sunny';
    if (precipitation > 10) {
      condition = 'rainy';
    } else if (precipitation > 2) {
      condition = 'cloudy';
    } else if (temp < 10) {
      condition = 'partly_cloudy';
    }
    
    return {
      current: {
        temperature: Math.round(temp),
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 3.6), // Convert m/s to km/h
        precipitation: Math.round((precipitation / 10) * 100), // Convert to percentage estimate
        condition,
        feelsLike: Math.round(temp - (windSpeed * 0.5)),
      },
      location: { lat, lng },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('NASA POWER API fetch error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // Validate parameters
  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat and lng' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);

  // Validate coordinate ranges
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' },
      { status: 400 }
    );
  }

  try {
    // Try NASA POWER API first
    let weatherData = await fetchNASAWeather(lat, lng);
    
    // Fall back to mock data if NASA API fails
    if (!weatherData) {
      console.log('Falling back to mock weather data');
      weatherData = generateMockWeather(lat, lng);
    }

    return NextResponse.json(weatherData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    
    // Return mock data as ultimate fallback
    const mockWeather = generateMockWeather(lat, lng);
    return NextResponse.json(mockWeather, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    });
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

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

// Fetch from Open-Meteo API (real-time, accurate, free)
async function fetchOpenMeteoWeather(lat: number, lng: number): Promise<WeatherResponse | null> {
  try {
    // Open-Meteo API - free, no API key needed, real-time data
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Open-Meteo API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const current = data.current;
    
    if (!current) {
      return null;
    }
    
    const temp = current.temperature_2m ?? 20;
    const humidity = current.relative_humidity_2m ?? 60;
    const windSpeed = current.wind_speed_10m ?? 10;
    const precipitation = current.precipitation ?? 0;
    const weatherCode = current.weather_code ?? 0;
    const feelsLike = current.apparent_temperature ?? temp;
    
    // Map WMO weather codes to conditions
    // https://open-meteo.com/en/docs
    let condition = 'sunny';
    if (weatherCode === 0) condition = 'sunny';
    else if (weatherCode <= 3) condition = 'partly_cloudy';
    else if (weatherCode <= 48) condition = 'cloudy';
    else if (weatherCode <= 67 || weatherCode <= 77) condition = 'rainy';
    else if (weatherCode <= 99) condition = 'rainy';
    
    // Calculate precipitation probability (0-100%)
    const precipProbability = precipitation > 0 ? Math.min(100, precipitation * 10) : 0;
    
    return {
      current: {
        temperature: Math.round(temp),
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed),
        precipitation: Math.round(precipProbability),
        condition,
        feelsLike: Math.round(feelsLike),
      },
      location: { lat, lng },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Open-Meteo API fetch error:', error);
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
    // Try Open-Meteo API first (real-time, accurate)
    let weatherData = await fetchOpenMeteoWeather(lat, lng);
    
    // Fall back to mock data if API fails
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

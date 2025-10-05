import { NextRequest, NextResponse } from 'next/server';

/**
 * Smart Route API Endpoint
 * 
 * Calculates weather-aware routes between two locations
 * Includes weather risk assessment along the route
 * 
 * POST /api/route
 * Body: {
 *   from: { lat: number, lng: number, name?: string },
 *   to: { lat: number, lng: number, name?: string },
 *   mode?: 'driving' | 'walking' | 'cycling'
 * }
 */

interface RouteRequest {
  from: {
    lat: number;
    lng: number;
    name?: string;
  };
  to: {
    lat: number;
    lng: number;
    name?: string;
  };
  mode?: 'driving' | 'walking' | 'cycling';
}

interface RouteResponse {
  route: {
    distance: number; // km
    duration: number; // minutes
    polyline: Array<[number, number]>; // [lat, lng]
    steps: Array<{
      distance: number;
      duration: number;
      instruction: string;
      coordinates: [number, number];
    }>;
  };
  weather: {
    current: {
      temperature: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
    };
    forecast: Array<{
      time: string;
      temperature: number;
      precipitation: number;
      condition: string;
    }>;
  };
  risk: {
    level: 'low' | 'moderate' | 'high' | 'extreme';
    score: number; // 0-100
    factors: string[];
    recommendations: string[];
  };
}

// Calculate great circle distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate route polyline (simplified - real implementation would use routing API)
function generateRoutePolyline(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  points: number = 10
): Array<[number, number]> {
  const polyline: Array<[number, number]> = [];
  
  for (let i = 0; i <= points; i++) {
    const ratio = i / points;
    const lat = from.lat + (to.lat - from.lat) * ratio;
    const lng = from.lng + (to.lng - from.lng) * ratio;
    polyline.push([lat, lng]);
  }
  
  return polyline;
}

// Fetch weather for a location
async function fetchWeatherForLocation(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const current = data.current;
    const hourly = data.hourly;
    
    // Map weather codes to conditions
    const getCondition = (code: number) => {
      if (code === 0) return 'Clear';
      if (code <= 3) return 'Partly Cloudy';
      if (code <= 48) return 'Cloudy';
      if (code <= 67) return 'Rainy';
      if (code <= 77) return 'Snowy';
      return 'Stormy';
    };
    
    return {
      current: {
        temperature: Math.round(current.temperature_2m),
        precipitation: current.precipitation || 0,
        windSpeed: Math.round(current.wind_speed_10m),
        condition: getCondition(current.weather_code),
      },
      forecast: hourly.time.slice(0, 6).map((time: string, idx: number) => ({
        time,
        temperature: Math.round(hourly.temperature_2m[idx]),
        precipitation: hourly.precipitation_probability?.[idx] || 0,
        condition: getCondition(hourly.weather_code[idx]),
      })),
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

// Calculate route risk based on weather
function calculateRouteRisk(weather: any): {
  level: 'low' | 'moderate' | 'high' | 'extreme';
  score: number;
  factors: string[];
  recommendations: string[];
} {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];
  
  if (!weather) {
    return {
      level: 'moderate',
      score: 50,
      factors: ['Weather data unavailable'],
      recommendations: ['Check weather conditions before departure'],
    };
  }
  
  const { current } = weather;
  
  // Temperature risk
  if (current.temperature < -10) {
    score += 30;
    factors.push(`Extreme cold: ${current.temperature}°C`);
    recommendations.push('Dress in warm layers, protect extremities');
  } else if (current.temperature > 35) {
    score += 25;
    factors.push(`Extreme heat: ${current.temperature}°C`);
    recommendations.push('Stay hydrated, take breaks in shade');
  }
  
  // Precipitation risk
  if (current.precipitation > 10) {
    score += 40;
    factors.push(`Heavy precipitation: ${current.precipitation}mm`);
    recommendations.push('Drive carefully, reduce speed');
  } else if (current.precipitation > 2) {
    score += 20;
    factors.push(`Light precipitation: ${current.precipitation}mm`);
    recommendations.push('Exercise caution on roads');
  }
  
  // Wind risk
  if (current.windSpeed > 50) {
    score += 35;
    factors.push(`Very strong winds: ${current.windSpeed} km/h`);
    recommendations.push('Avoid travel if possible, secure loose items');
  } else if (current.windSpeed > 30) {
    score += 20;
    factors.push(`Strong winds: ${current.windSpeed} km/h`);
    recommendations.push('Drive carefully, watch for debris');
  }
  
  // Stormy conditions
  if (current.condition === 'Stormy') {
    score += 50;
    factors.push('Severe weather conditions');
    recommendations.push('Consider postponing travel');
  }
  
  // Determine risk level
  let level: 'low' | 'moderate' | 'high' | 'extreme';
  if (score >= 75) level = 'extreme';
  else if (score >= 50) level = 'high';
  else if (score >= 25) level = 'moderate';
  else level = 'low';
  
  // Add default recommendations
  if (factors.length === 0) {
    factors.push('Good weather conditions');
    recommendations.push('Safe travel conditions expected');
  }
  
  return { level, score: Math.min(100, score), factors, recommendations };
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json();
    const { from, to, mode = 'driving' } = body;
    
    // Validate input
    if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
      return NextResponse.json(
        { error: 'Missing required coordinates' },
        { status: 400 }
      );
    }
    
    // Calculate route distance and duration
    const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
    
    // Estimate duration based on mode
    let speedKmH = 60; // driving default
    if (mode === 'walking') speedKmH = 5;
    else if (mode === 'cycling') speedKmH = 15;
    
    const duration = Math.round((distance / speedKmH) * 60); // minutes
    
    // Generate route polyline
    const polyline = generateRoutePolyline(from, to);
    
    // Generate route steps
    const steps = polyline.slice(0, -1).map((point, idx) => {
      const nextPoint = polyline[idx + 1];
      const stepDistance = calculateDistance(point[0], point[1], nextPoint[0], nextPoint[1]);
      const stepDuration = Math.round((stepDistance / speedKmH) * 60);
      
      return {
        distance: Math.round(stepDistance * 10) / 10,
        duration: stepDuration,
        instruction: idx === 0 
          ? `Start from ${from.name || 'origin'}`
          : idx === polyline.length - 2
          ? `Arrive at ${to.name || 'destination'}`
          : `Continue towards ${to.name || 'destination'}`,
        coordinates: point,
      };
    });
    
    // Fetch weather for midpoint of route
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    const weather = await fetchWeatherForLocation(midLat, midLng);
    
    // Calculate risk
    const risk = calculateRouteRisk(weather);
    
    const response: RouteResponse = {
      route: {
        distance: Math.round(distance * 10) / 10,
        duration,
        polyline,
        steps,
      },
      weather: weather || {
        current: {
          temperature: 20,
          precipitation: 0,
          windSpeed: 10,
          condition: 'Unknown',
        },
        forecast: [],
      },
      risk,
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Route calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route', details: error.message },
      { status: 500 }
    );
  }
}

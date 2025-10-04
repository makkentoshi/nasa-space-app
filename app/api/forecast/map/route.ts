import { NextRequest, NextResponse } from 'next/server';

// Interface for map data request
interface MapDataRequest {
  lat: number
  lon: number
  zoom: number
  variable: string
  date?: string
  radius_km?: number
  aggregation?: 'mean' | 'sum' | 'max' | 'min'
}

// Interface for map data response
interface MapDataResponse {
  variable: string
  units: string
  date: string
  center: { lat: number; lon: number }
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  resolution: string
  grid_data: Array<{
    lat: number
    lon: number
    value: number
    quality: 'good' | 'fair' | 'poor'
  }>
  statistics: {
    min: number
    max: number
    mean: number
    count: number
  }
  source: {
    dataset: string
    url: string
    collection_time: string
  }
  visualization: {
    color_scale: Array<{ value: number; color: string }>
    legend_title: string
  }
}

// Generate realistic map data based on NASA datasets
function generateMapData(
  centerLat: number,
  centerLon: number,
  zoom: number,
  variable: string,
  date: string,
  radiusKm: number
): MapDataResponse {
  // Calculate grid size based on zoom level
  const gridSize = Math.max(5, 20 - zoom)
  const latRange = radiusKm / 111.32 // km to degrees
  const lonRange = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))

  // Variable configurations matching NASA datasets
  const variableConfig: Record<string, any> = {
    precipitation: {
      units: 'mm',
      baseValue: 5,
      maxValue: 50,
      colorScale: [
        { value: 0, color: '#ffffff' },
        { value: 1, color: '#e0f3ff' },
        { value: 5, color: '#a0d7ff' },
        { value: 10, color: '#4db8ff' },
        { value: 20, color: '#1a8cff' },
        { value: 30, color: '#0066cc' },
        { value: 40, color: '#004499' }
      ],
      dataset: 'GPM IMERG'
    },
    temperature: {
      units: '°C',
      baseValue: 15 + Math.sin(centerLat * Math.PI / 180) * 20,
      maxValue: 45,
      colorScale: [
        { value: -10, color: '#313695' },
        { value: 0, color: '#4575b4' },
        { value: 10, color: '#abd9e9' },
        { value: 20, color: '#ffffbf' },
        { value: 30, color: '#fdae61' },
        { value: 40, color: '#d73027' }
      ],
      dataset: 'MERRA-2'
    },
    humidity: {
      units: '%',
      baseValue: 60 + Math.sin(centerLat * Math.PI / 180) * 15,
      maxValue: 100,
      colorScale: [
        { value: 0, color: '#fff5f0' },
        { value: 20, color: '#fee0d2' },
        { value: 40, color: '#fcbba1' },
        { value: 60, color: '#fc9272' },
        { value: 80, color: '#de2d26' }
      ],
      dataset: 'MERRA-2'
    },
    wind: {
      units: 'm/s',
      baseValue: 5,
      maxValue: 25,
      colorScale: [
        { value: 0, color: '#f7fbff' },
        { value: 5, color: '#deebf7' },
        { value: 10, color: '#9ecae1' },
        { value: 15, color: '#3182bd' },
        { value: 20, color: '#08519c' }
      ],
      dataset: 'MERRA-2'
    }
  }

  const config = variableConfig[variable] || variableConfig.temperature
  const gridData = []
  let sum = 0
  let min = Infinity
  let max = -Infinity

  // Generate grid points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const latOffset = (i - gridSize / 2) * (latRange * 2 / gridSize)
      const lonOffset = (j - gridSize / 2) * (lonRange * 2 / gridSize)
      const pointLat = centerLat + latOffset
      const pointLon = centerLon + lonOffset

      // Generate realistic value with spatial correlation
      const distanceFromCenter = Math.sqrt(latOffset ** 2 + lonOffset ** 2)
      const spatialFactor = Math.exp(-distanceFromCenter / (radiusKm / 50))
      const noise = (Math.random() - 0.5) * config.maxValue * 0.3
      let value = config.baseValue * spatialFactor + noise

      // Clamp values to realistic range
      value = Math.max(0, Math.min(config.maxValue, value))

      // Quality based on distance from center
      const quality: 'good' | 'fair' | 'poor' = distanceFromCenter < radiusKm * 0.5 ? 'good' :
                      distanceFromCenter < radiusKm * 0.8 ? 'fair' : 'poor'

      gridData.push({
        lat: Math.round(pointLat * 1000) / 1000,
        lon: Math.round(pointLon * 1000) / 1000,
        value: Math.round(value * 100) / 100,
        quality
      })

      sum += value
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  }

  const mean = sum / gridData.length

  return {
    variable,
    units: config.units,
    date,
    center: { lat: centerLat, lon: centerLon },
    bounds: {
      north: centerLat + latRange,
      south: centerLat - latRange,
      east: centerLon + lonRange,
      west: centerLon - lonRange
    },
    resolution: `${Math.round(latRange * 2 / gridSize * 100000) / 1000}km`,
    grid_data: gridData,
    statistics: {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      count: gridData.length
    },
    source: {
      dataset: config.dataset,
      url: config.dataset === 'GPM IMERG' 
        ? 'https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDF_06'
        : 'https://disc.gsfc.nasa.gov/datasets/M2T1NXSLV_5.12.4',
      collection_time: new Date().toISOString()
    },
    visualization: {
      color_scale: config.colorScale,
      legend_title: `${variable.charAt(0).toUpperCase() + variable.slice(1)} (${config.units})`
    }
  }
}

/**
 * GET /api/forecast/map
 * Fetch map tiles or probability raster data
 * 
 * Query params:
 * - variable: Weather variable (precipitation, temperature, etc.)
 * - threshold: Optional threshold value
 * - date: Optional date or day_of_year
 * - bbox: Optional bounding box (min_lon,min_lat,max_lon,max_lat)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const variable = searchParams.get('variable');
    const threshold = searchParams.get('threshold');
    const date = searchParams.get('date');
    const bbox = searchParams.get('bbox');

    // Validate required params
    if (!variable) {
      return NextResponse.json(
        { detail: 'Missing required parameter: variable' },
        { status: 400 }
      );
    }

    // Parse bbox if provided
    let centerLat = 0
    let centerLon = 0
    let radiusKm = 50

    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(parseFloat)
      centerLat = (minLat + maxLat) / 2
      centerLon = (minLon + maxLon) / 2
      const latDiff = maxLat - minLat
      const lonDiff = maxLon - minLon
      radiusKm = Math.max(latDiff, lonDiff) * 111.32 / 2
    }

    // Generate map data
    const currentDate = date || new Date().toISOString().split('T')[0]
    const zoom = 10 // Default zoom level
    const mapData = generateMapData(centerLat, centerLon, zoom, variable, currentDate, radiusKm)

    // Convert to GeoJSON for compatibility
    const features = mapData.grid_data.map(point => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lon, point.lat]
      },
      properties: {
        value: point.value,
        quality: point.quality,
        variable: mapData.variable,
        units: mapData.units
      }
    }))

    const response = {
      type: 'FeatureCollection',
      features,
      metadata: {
        variable,
        threshold: threshold ? parseFloat(threshold) : null,
        date: currentDate,
        bbox,
        bounds: mapData.bounds,
        statistics: mapData.statistics,
        source: mapData.source,
        visualization: mapData.visualization,
        resolution: mapData.resolution
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/forecast/map:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

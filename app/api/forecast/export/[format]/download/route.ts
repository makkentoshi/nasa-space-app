import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/forecast/export/[format]/download?jobId=xxx
 * Download the exported file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ format: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const { format } = await params

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      )
    }

    // In production, you would:
    // 1. Verify job exists and is completed
    // 2. Check expiration
    // 3. Stream file from storage (S3/Azure/GCS)
    // 4. Log download
    // 5. Update download counter

    // Generate mock file content based on format
    const { content, contentType, filename } = generateMockFile(format, jobId)

    // Convert Buffer to ArrayBuffer for NextResponse
    const body = typeof content === 'string' ? content : new Uint8Array(content)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Job-ID': jobId
      }
    })

  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    )
  }
}

/**
 * Generate mock file for download
 */
function generateMockFile(format: string, jobId: string): {
  content: string | Buffer
  contentType: string
  filename: string
} {
  const timestamp = new Date().toISOString().split('T')[0]

  switch (format.toLowerCase()) {
    case 'csv': {
      const csv = generateMockCSV()
      return {
        content: csv,
        contentType: 'text/csv',
        filename: `climate_data_${timestamp}.csv`
      }
    }

    case 'json': {
      const json = generateMockJSON()
      return {
        content: json,
        contentType: 'application/json',
        filename: `climate_data_${timestamp}.json`
      }
    }

    case 'geotiff': {
      // In production, generate real GeoTIFF
      const mockBuffer = Buffer.from('Mock GeoTIFF file content')
      return {
        content: mockBuffer,
        contentType: 'image/tiff',
        filename: `climate_data_${timestamp}.tif`
      }
    }

    case 'netcdf': {
      // In production, generate real NetCDF
      const mockBuffer = Buffer.from('Mock NetCDF file content')
      return {
        content: mockBuffer,
        contentType: 'application/x-netcdf',
        filename: `climate_data_${timestamp}.nc`
      }
    }

    default:
      throw new Error('Unsupported format')
  }
}

/**
 * Generate mock CSV data
 */
function generateMockCSV(): string {
  const rows = [
    'date,lat,lng,precipitation,temperature,humidity,wind_speed',
    '2023-01-01,40.7128,-74.0060,2.5,15.3,65.2,12.4',
    '2023-01-02,40.7128,-74.0060,0.0,16.1,62.8,10.2',
    '2023-01-03,40.7128,-74.0060,5.2,14.8,70.5,15.6',
    '2023-01-04,40.7128,-74.0060,1.8,15.9,68.1,11.8',
    '2023-01-05,40.7128,-74.0060,0.0,17.2,60.3,9.5',
    '2023-01-06,40.7128,-74.0060,3.1,16.5,66.7,13.2',
    '2023-01-07,40.7128,-74.0060,0.5,17.8,58.9,8.7'
  ]

  // Add more sample data
  for (let i = 8; i <= 100; i++) {
    const date = new Date(2023, 0, i).toISOString().split('T')[0]
    const precip = (Math.random() * 10).toFixed(1)
    const temp = (15 + Math.random() * 10).toFixed(1)
    const humidity = (50 + Math.random() * 30).toFixed(1)
    const wind = (5 + Math.random() * 15).toFixed(1)
    
    rows.push(`${date},40.7128,-74.0060,${precip},${temp},${humidity},${wind}`)
  }

  return rows.join('\n')
}

/**
 * Generate mock JSON data
 */
function generateMockJSON(): string {
  const data = {
    metadata: {
      exportDate: new Date().toISOString(),
      source: 'NASA POWER API',
      variables: ['precipitation', 'temperature', 'humidity', 'wind_speed'],
      dateRange: { start: '2023-01-01', end: '2023-12-31' },
      location: { lat: 40.7128, lng: -74.0060, name: 'New York, NY' },
      recordCount: 365,
      units: {
        precipitation: 'mm',
        temperature: '°C',
        humidity: '%',
        wind_speed: 'm/s'
      },
      citation: 'NASA/POWER CERES/MERRA2 Native Resolution Daily Data',
      disclaimer: 'These data were obtained from the NASA Langley Research Center POWER Project funded through the NASA Earth Science Directorate Applied Science Program.'
    },
    data: [] as any[]
  }

  // Generate sample data
  for (let i = 0; i < 100; i++) {
    const date = new Date(2023, 0, i + 1)
    data.data.push({
      date: date.toISOString().split('T')[0],
      lat: 40.7128,
      lng: -74.0060,
      values: {
        precipitation: parseFloat((Math.random() * 10).toFixed(2)),
        temperature: parseFloat((15 + Math.random() * 10).toFixed(2)),
        humidity: parseFloat((50 + Math.random() * 30).toFixed(2)),
        wind_speed: parseFloat((5 + Math.random() * 15).toFixed(2))
      },
      quality_flags: {
        precipitation: 'good',
        temperature: 'good',
        humidity: 'good',
        wind_speed: 'good'
      }
    })
  }

  return JSON.stringify(data, null, 2)
}

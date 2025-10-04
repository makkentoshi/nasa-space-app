# resQ Backend API (TypeScript / Next.js)

Backend API implementation using **Next.js 15 App Router** with TypeScript. All endpoints are implemented as API routes in `app/api/`.

## Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js / Edge Runtime (configurable)
- **API Pattern**: RESTful with JSON responses
- **Data Processing**: TypeScript statistical utilities

## API Endpoints

### Health Check
```
GET /api/health
```
Returns service status and version.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T12:00:00.000Z",
  "service": "resQ Forecast API",
  "version": "0.1.0"
}
```

### Forecast Statistics
```
POST /api/forecast/statistics
```
Calculate climatological statistics for a location and day of year.

**Request Body:**
```json
{
  "lat": 40.7128,
  "lon": -74.0060,
  "day_of_year": 180,
  "window_days": 3,
  "variable": "precipitation",
  "threshold": 20,
  "baseline_period": { "start_year": 2001, "end_year": 2015 },
  "recent_period": { "start_year": 2016, "end_year": 2023 }
}
```

**Response:** See `StatisticsResponse` type in `app/types/index.ts`

**Implementation TODO:**
- Fetch NASA data (GPM IMERG, MERRA-2)
- Extract time series for day_of_year ± window
- Calculate statistics (mean, median, percentiles)
- Bootstrap CI for p_exceed
- Mann-Kendall trend test
- Baseline vs recent comparison

### AI Query
```
POST /api/ai/query
```
Query AI assistant with natural language about weather conditions.

**Request Body:**
```json
{
  "user_query": "Is it likely to rain during my parade?",
  "location": { "lat": 40.7128, "lon": -74.0060 },
  "day_of_year": 180,
  "window_days": 3,
  "variables": ["precipitation"],
  "thresholds": { "precipitation": 20 },
  "user_profile": { "activity_type": "parade" },
  "language": "en"
}
```

**Response:** See `AIQueryResponse` type

**Implementation TODO:**
- Call `/api/forecast/statistics` internally for each variable
- Build context documents (short summaries)
- Query vector DB for relevant historical context
- Construct GPT prompt with system instructions
- Call OpenAI API
- Parse and format response

### Map Data
```
GET /api/forecast/map?variable=precipitation&threshold=20&bbox=-75,40,-73,41
```
Fetch map tiles or probability raster data.

**Query Parameters:**
- `variable`: Weather variable (required)
- `threshold`: Threshold value (optional)
- `date`: Date or day_of_year (optional)
- `bbox`: Bounding box as `min_lon,min_lat,max_lon,max_lat` (optional)

**Response:** GeoJSON or tile reference

**Implementation TODO:**
- Parse bbox or use global extent
- Query precomputed tiles or generate on-demand
- Support TMS/XYZ tile scheme
- Cache in Redis/S3

### Export Data
```
POST /api/export/[format]
```
Generate export file in CSV, JSON, or GeoTIFF format.

**Formats:**
- `csv` - Time series and summary statistics
- `json` - Complete structured data
- `geotiff` - Raster data with spatial metadata

**Request Body:** Statistics or map data to export

**Response:**
```json
{
  "url": "/downloads/csv/export_12345.csv",
  "format": "csv",
  "fileId": "export_12345",
  "expiresAt": "2025-10-04T13:00:00.000Z"
}
```

**Implementation TODO:**
- Generate file based on format
- Store in S3/MinIO
- Return presigned URL
- Set expiration (1 hour)

## Project Structure

```
app/
├── api/
│   ├── health/
│   │   └── route.ts           # Health check
│   ├── forecast/
│   │   ├── statistics/
│   │   │   └── route.ts       # POST statistics calculation
│   │   └── map/
│   │       └── route.ts       # GET map tiles/raster
│   ├── ai/
│   │   └── query/
│   │       └── route.ts       # POST AI assistant query
│   └── export/
│       └── [format]/
│           └── route.ts       # POST/GET export files
├── lib/
│   ├── statistics/
│   │   └── core.ts           # Statistical functions
│   ├── data-sources/         # NASA data fetching (TODO)
│   ├── ai/                   # RAG pipeline (TODO)
│   └── storage/              # S3/Redis clients (TODO)
└── types/
    └── index.ts              # TypeScript types
```

## Statistical Utilities

Implemented in `app/lib/statistics/core.ts`:

- **calculateBasicStats**: Mean, median, std, percentiles
- **calculateExceedanceProbability**: P(X > threshold)
- **bootstrapCI**: Bootstrap confidence intervals
- **mannKendallTest**: Trend test (S statistic, p-value)
- **sensSlope**: Robust slope estimator
- **comparePeriods**: Baseline vs recent comparison

## Environment Variables

Create `.env.local`:

```env
# NASA Data Access
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password

# OpenAI API
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Vector DB (Pinecone)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX=resq-forecast

# Storage (S3/MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=resq-data

# Redis
REDIS_URL=redis://localhost:6379

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/resq
```

## Running the API

Development:
```bash
npm run dev
```

API available at: `http://localhost:3000/api/*`

Production:
```bash
npm run build
npm start
```

## Testing

```bash
# Test health check
curl http://localhost:3000/api/health

# Test statistics endpoint
curl -X POST http://localhost:3000/api/forecast/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7128,
    "lon": -74.0060,
    "day_of_year": 180,
    "variable": "precipitation",
    "baseline_period": {"start_year": 2001, "end_year": 2015},
    "recent_period": {"start_year": 2016, "end_year": 2023}
  }'
```

## Next Steps (Implementation TODOs)

1. **Data Sources** (`lib/data-sources/`)
   - Implement NASA data fetching (GPM IMERG, MERRA-2, NASA POWER)
   - Support OPeNDAP, HDF5, NetCDF formats
   - Cache data locally or in S3

2. **AI/RAG Pipeline** (`lib/ai/`)
   - Vector DB client (Pinecone/Weaviate)
   - Document builder for embeddings
   - GPT client with prompt templates
   - RAG orchestration

3. **Storage** (`lib/storage/`)
   - S3/MinIO client for data storage
   - Redis client for caching
   - File generation utilities

4. **Data Processing**
   - Integrate statistical functions in routes
   - Handle real NASA data parsing
   - Implement time series extraction

5. **Export Generation**
   - CSV writer with time series
   - GeoTIFF generation with GDAL
   - S3 upload and presigned URLs

## Dependencies

Key packages needed (add to `package.json`):

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x",
    "@pinecone-database/pinecone": "^2.x",
    "openai": "^4.x",
    "redis": "^4.x",
    "@prisma/client": "^5.x"
  }
}
```

## Notes

- All routes use TypeScript for type safety
- Error handling with try/catch and proper HTTP status codes
- Skeleton implementations include TODO comments for next steps
- Statistical functions are pure TypeScript (no Python dependencies)

## License

MIT

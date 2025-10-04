# resQ - Forecast Mode (Frontend)

Climate forecast PWA application for NASA Space Apps Challenge 2025: "Will It Rain On My Parade?"

## Overview

resQ Forecast Mode is a Progressive Web App that provides climatological statistics and AI-powered recommendations for weather conditions at any location and day of the year. Built with Next.js, React, and Leaflet for interactive mapping.

## Features

- 🗺️ **Interactive Map**: Click any location to get climate statistics
- 📅 **Day Selector**: Choose any day of the year with configurable window
- 🌡️ **Multiple Variables**: Precipitation, temperature, wind speed, humidity, cloud cover
- 📊 **Statistical Analysis**: Mean, median, percentiles, probability of exceedance, trends
- 🤖 **AI Assistant**: GPT-5 powered recommendations based on your query
- 💾 **Export Options**: Download data as CSV, JSON, or GeoTIFF
- 📱 **PWA Support**: Works offline, installable on mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Mapping**: Leaflet, react-leaflet
- **State Management**: React Context API
- **TypeScript**: Full type safety
- **PWA**: next-pwa with service worker support

## Project Structure

```
app/
├── components/          # React components
│   ├── AIChat.tsx      # AI assistant chat interface
│   ├── DaySelector.tsx # Day of year picker
│   ├── ExportButtons.tsx # Data export controls
│   ├── Map.tsx         # Leaflet map component
│   ├── RegisterSW.tsx  # Service worker registration
│   ├── StatisticsChart.tsx # Data visualization
│   └── ThresholdInput.tsx # Variable and threshold selector
├── contexts/           # React context providers
│   └── ForecastContext.tsx # Global forecast state
├── lib/               # Utilities
│   └── api.ts        # Backend API client
├── types/            # TypeScript definitions
│   └── index.ts      # All type definitions
├── globals.css       # Global styles
├── layout.tsx        # Root layout with providers
└── page.tsx          # Main forecast page
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Components

### Map
Interactive Leaflet map for location selection. Click anywhere to pin a location and load statistics.

### DaySelector
Slider to choose day of year (1-365) and window size (±days). Includes quick presets for common dates.

### ThresholdInput
Select weather variable and optionally set a threshold for probability calculations.

### StatisticsChart
Displays comprehensive statistics including:
- Summary stats (mean, median, std dev)
- Percentiles (p10, p25, p50, p75, p90, p95)
- Probability of exceeding threshold
- Trend analysis (Mann-Kendall, Sen's slope)
- Baseline vs recent period comparison
- Time series data

### AIChat
Floating chat panel for natural language queries about weather conditions. Provides:
- User-friendly answers
- Technical explanations
- Recommended actions
- Confidence scores
- Source citations

### ExportButtons
Download statistics in multiple formats:
- CSV: Time series and summary stats
- JSON: Complete structured data
- GeoTIFF: Raster data for GIS applications

## API Integration

The frontend communicates with a FastAPI backend. Expected endpoints:

- `POST /api/forecast/statistics` - Get climatological statistics
- `POST /api/ai/query` - Query AI assistant
- `GET /api/forecast/map` - Get map tiles/raster data
- `POST /api/export/{format}` - Generate export files

## PWA Configuration

PWA features are enabled via `next-pwa`:
- Service worker for offline support
- Web app manifest with theme colors
- Installable on mobile devices
- Caching strategy for API responses

## Development

### Type Safety
All components use TypeScript with strict mode. See `app/types/index.ts` for type definitions.

### State Management
Global state is managed via `ForecastContext`.

### Styling
Tailwind CSS 4 with custom gradient themes.

## Data Sources

- GPM IMERG (precipitation)
- MERRA-2 (reanalysis)
- NASA POWER (surface meteorology)

"use client";

import dynamic from 'next/dynamic';
import { useForecast } from '@/app/contexts/ForecastContext';
import DaySelector from '@/app/components/DaySelector';
import ThresholdInput from '@/app/components/ThresholdInput';
import StatisticsChart from '@/app/components/StatisticsChart';
import AIChat from '@/app/components/AIChat';
import ExportButtons from '@/app/components/ExportButtons';

// Dynamic import for Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/app/components/Map'), { ssr: false });

export default function Home() {
  const {
    forecastState,
    aiState,
    setLocation,
    setDayOfYear,
    setWindowDays,
    setVariable,
    setThreshold,
    loadStatistics,
    askAI,
  } = useForecast();

  const handleLoadStatistics = async () => {
    await loadStatistics();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">resQ - Forecast Mode</h1>
          <p className="text-sm text-blue-100 mt-1">
            NASA Challenge: Will It Rain On My Parade?
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <DaySelector
              dayOfYear={forecastState.day_of_year}
              windowDays={forecastState.window_days}
              onDayChange={setDayOfYear}
              onWindowChange={setWindowDays}
            />

            <ThresholdInput
              variable={forecastState.variable}
              threshold={forecastState.threshold}
              onVariableChange={setVariable}
              onThresholdChange={setThreshold}
            />

            <button
              onClick={handleLoadStatistics}
              disabled={!forecastState.location || forecastState.loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition shadow-md"
            >
              {forecastState.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                'Load Statistics'
              )}
            </button>

            {forecastState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">❌ {forecastState.error}</p>
              </div>
            )}

            <ExportButtons statistics={forecastState.statistics} />
          </div>

          {/* Right Column - Map and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Select Location</h2>
                <p className="text-xs text-gray-600 mt-1">
                  Click on the map to select a location for analysis
                </p>
              </div>
              <Map
                onLocationSelect={setLocation}
                selectedLocation={forecastState.location}
                className="h-[400px]"
              />
            </div>

            {/* Statistics Results */}
            {forecastState.statistics && (
              <StatisticsChart statistics={forecastState.statistics} />
            )}

            {!forecastState.statistics && !forecastState.loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Data Yet
                </h3>
                <p className="text-sm text-gray-600">
                  Select a location on the map, configure your parameters, and click "Load Statistics"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* AI Chat Component */}
      <AIChat
        onQuery={askAI}
        response={aiState.response}
        loading={aiState.loading}
        error={aiState.error}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm">
            resQ - NASA Space Apps Challenge 2025
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data sources: GPM IMERG, MERRA-2, NASA POWER
          </p>
        </div>
      </footer>
    </div>
  );
}

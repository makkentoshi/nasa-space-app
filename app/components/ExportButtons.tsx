"use client";

import React, { useState } from 'react';
import type { ExportFormat, StatisticsResponse } from '@/app/types';
import { requestExport } from '@/app/lib/api';

interface ExportButtonsProps {
  statistics?: StatisticsResponse;
  className?: string;
}

export default function ExportButtons({ statistics, className = '' }: ExportButtonsProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!statistics) {
      setError('No data to export. Please load statistics first.');
      return;
    }

    setLoading(format);
    setError(null);

    try {
      const result = await requestExport({
        format,
        data: statistics,
      });

      // Trigger download
      window.open(result.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(null);
    }
  };

  const isDisabled = !statistics;

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Export Data</h3>
      
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleExport('csv')}
          disabled={isDisabled || loading === 'csv'}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          {loading === 'csv' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              📄 CSV
            </>
          )}
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={isDisabled || loading === 'json'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          {loading === 'json' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              📊 JSON
            </>
          )}
        </button>

        <button
          onClick={() => handleExport('geotiff')}
          disabled={isDisabled || loading === 'geotiff'}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          {loading === 'geotiff' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              🗺️ GeoTIFF
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {isDisabled && (
        <p className="mt-3 text-xs text-gray-500">
          Load statistics first to enable export
        </p>
      )}
    </div>
  );
}

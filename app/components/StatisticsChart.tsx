"use client";

import React from 'react';
import type { StatisticsResponse } from '@/app/types';

interface StatisticsChartProps {
  statistics: StatisticsResponse;
  className?: string;
}

export default function StatisticsChart({ statistics, className = '' }: StatisticsChartProps) {
  const {
    variable,
    units,
    n_years,
    mean,
    median,
    std,
    percentiles,
    p_exceed,
    p_exceed_CI,
    trend,
    baseline_vs_recent,
    time_series,
    caveats,
  } = statistics;

  // TODO: Integrate Chart.js or Recharts for visualization
  // For now, showing data in structured format

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h3 className="text-xl font-bold mb-4 capitalize">
        {variable.replace('_', ' ')} Statistics
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-gray-600">Mean</p>
          <p className="text-lg font-semibold">{mean.toFixed(2)} {units}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-gray-600">Median</p>
          <p className="text-lg font-semibold">{median.toFixed(2)} {units}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-gray-600">Std Dev</p>
          <p className="text-lg font-semibold">{std.toFixed(2)} {units}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-gray-600">Years</p>
          <p className="text-lg font-semibold">{n_years}</p>
        </div>
      </div>

      {/* Percentiles */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2">Percentiles</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(percentiles).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-2 rounded text-center">
              <p className="text-xs text-gray-600">{key.toUpperCase()}</p>
              <p className="text-sm font-semibold">{value.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Probability of Exceedance */}
      {p_exceed !== undefined && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-semibold mb-2">Probability of Exceedance</h4>
          <p className="text-2xl font-bold text-yellow-800">
            {(p_exceed * 100).toFixed(1)}%
          </p>
          {p_exceed_CI && (
            <p className="text-xs text-gray-600 mt-1">
              95% CI: [{(p_exceed_CI[0] * 100).toFixed(1)}%, {(p_exceed_CI[1] * 100).toFixed(1)}%]
            </p>
          )}
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-sm font-semibold mb-2">Trend Analysis</h4>
          <p className="text-sm">
            Slope: <strong>{trend.slope.toFixed(4)} {units}/year</strong>
          </p>
          <p className="text-sm">
            P-value: <strong>{trend.p_value.toFixed(4)}</strong> {trend.p_value < 0.05 ? '(Significant)' : '(Not significant)'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Method: {trend.method}</p>
        </div>
      )}

      {/* Baseline vs Recent */}
      {baseline_vs_recent && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
          <h4 className="text-sm font-semibold mb-2">Baseline vs Recent Period</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Baseline P(exceed)</p>
              <p className="text-lg font-semibold">{(baseline_vs_recent.p_exceed_baseline * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Recent P(exceed)</p>
              <p className="text-lg font-semibold">{(baseline_vs_recent.p_exceed_recent * 100).toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-sm mt-2">
            Change: <strong className={baseline_vs_recent.delta_percent > 0 ? 'text-red-600' : 'text-green-600'}>
              {baseline_vs_recent.delta_percent > 0 ? '+' : ''}{baseline_vs_recent.delta_percent.toFixed(1)}%
            </strong>
          </p>
        </div>
      )}

      {/* Time Series Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2">Time Series (Recent 10 years)</h4>
        <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
          <div className="grid grid-cols-5 gap-2 text-xs">
            {time_series.slice(-10).map((point) => (
              <div key={point.year} className="text-center">
                <p className="text-gray-600">{point.year}</p>
                <p className="font-semibold">{point.value.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Showing {Math.min(10, time_series.length)} of {time_series.length} years
        </p>
      </div>

      {/* Caveats */}
      {caveats && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs font-semibold text-red-800 mb-1">⚠️ Caveats</p>
          <p className="text-xs text-gray-700">{caveats}</p>
        </div>
      )}

      {/* Data Sources */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Data Sources</h4>
        {statistics.source.map((src, idx) => (
          <div key={idx} className="text-xs text-gray-600 mb-1">
            <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {src.dataset}
            </a>
            {' - '}
            <span>{src.resolution}</span>
            {src.doi && <span className="ml-1">DOI: {src.doi}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

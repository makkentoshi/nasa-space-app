"use client";

import React from 'react';
import type { WeatherVariable } from '@/app/types';

interface ThresholdInputProps {
  variable: WeatherVariable;
  threshold?: number;
  onVariableChange: (variable: WeatherVariable) => void;
  onThresholdChange: (threshold: number | undefined) => void;
  className?: string;
}

const VARIABLE_CONFIG: Record<WeatherVariable, { label: string; unit: string; defaultThreshold: number; min: number; max: number; step: number }> = {
  precipitation: { label: 'Precipitation', unit: 'mm', defaultThreshold: 20, min: 0, max: 200, step: 5 },
  temperature: { label: 'Temperature', unit: '°C', defaultThreshold: 30, min: -40, max: 50, step: 1 },
  wind_speed: { label: 'Wind Speed', unit: 'm/s', defaultThreshold: 15, min: 0, max: 50, step: 1 },
  humidity: { label: 'Humidity', unit: '%', defaultThreshold: 80, min: 0, max: 100, step: 5 },
  cloud_cover: { label: 'Cloud Cover', unit: '%', defaultThreshold: 70, min: 0, max: 100, step: 10 },
};

export default function ThresholdInput({
  variable,
  threshold,
  onVariableChange,
  onThresholdChange,
  className = '',
}: ThresholdInputProps) {
  const config = VARIABLE_CONFIG[variable];
  const currentThreshold = threshold ?? config.defaultThreshold;

  const handleEnableThreshold = (enabled: boolean) => {
    if (enabled) {
      onThresholdChange(config.defaultThreshold);
    } else {
      onThresholdChange(undefined);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Weather Variable</h3>

      {/* Variable Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Variable
        </label>
        <select
          value={variable}
          onChange={(e) => onVariableChange(e.target.value as WeatherVariable)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(VARIABLE_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Threshold Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={threshold !== undefined}
            onChange={(e) => handleEnableThreshold(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Set threshold for probability calculation
          </span>
        </label>
      </div>

      {/* Threshold Input */}
      {threshold !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Threshold: {currentThreshold} {config.unit}
          </label>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={currentThreshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{config.min} {config.unit}</span>
            <span>{config.max} {config.unit}</span>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-gray-700">
              Calculate probability of {config.label.toLowerCase()} exceeding <strong>{currentThreshold} {config.unit}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

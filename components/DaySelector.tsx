"use client";

import React from 'react';

interface DaySelectorProps {
  dayOfYear: number;
  windowDays: number;
  onDayChange: (day: number) => void;
  onWindowChange: (window: number) => void;
  className?: string;
}

// Helper to convert day of year to readable date
function dayOfYearToDate(dayOfYear: number, year = 2024): string {
  const date = new Date(year, 0, dayOfYear);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DaySelector({
  dayOfYear,
  windowDays,
  onDayChange,
  onWindowChange,
  className = '',
}: DaySelectorProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Select Date</h3>
      
      {/* Day of Year Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Day of Year: {dayOfYear} ({dayOfYearToDate(dayOfYear)})
        </label>
        <input
          type="range"
          min="1"
          max="365"
          value={dayOfYear}
          onChange={(e) => onDayChange(parseInt(e.target.value))}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Jan 1</span>
          <span>Jul 1</span>
          <span>Dec 31</span>
        </div>
      </div>

      {/* Window Size Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Window: ±{windowDays} days
        </label>
        <input
          type="range"
          min="1"
          max="15"
          value={windowDays}
          onChange={(e) => onWindowChange(parseInt(e.target.value))}
          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">
          Analyzing {dayOfYearToDate(dayOfYear - windowDays)} - {dayOfYearToDate(dayOfYear + windowDays)}
        </p>
      </div>

      {/* Quick Date Presets */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={() => onDayChange(1)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
        >
          New Year
        </button>
        <button
          onClick={() => onDayChange(180)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
        >
          Mid-Year
        </button>
        <button
          onClick={() => onDayChange(244)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
        >
          Sep 1
        </button>
        <button
          onClick={() => onDayChange(365)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
        >
          New Year Eve
        </button>
      </div>
    </div>
  );
}

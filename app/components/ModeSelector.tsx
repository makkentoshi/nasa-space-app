"use client";

import React from 'react';

type AppMode = 'forecast' | 'emergency';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  className?: string;
}

export default function ModeSelector({ currentMode, onModeChange, className = '' }: ModeSelectorProps) {
  return (
    <div className={`bg-white rounded-full p-1 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center">
        <button
          onClick={() => onModeChange('emergency')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            currentMode === 'emergency'
              ? 'bg-[#53B175] text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Emergency
        </button>
        <button
          onClick={() => onModeChange('forecast')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            currentMode === 'forecast'
              ? 'bg-[#007AFF] text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Forecast
        </button>
      </div>
    </div>
  );
}

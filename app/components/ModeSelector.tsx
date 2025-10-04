"use client";

import React from 'react';
import type { AppMode } from '@/app/lib/design-system';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  className?: string;
}

export default function ModeSelector({ currentMode, onModeChange, className = '' }: ModeSelectorProps) {
  return (
    <div className={`flex items-center justify-center p-1 bg-white/90 backdrop-blur-lg rounded-full shadow-md ${className}`}>
      {/* Forecast Button */}
      <button
        onClick={() => onModeChange('forecast')}
        className={`
          relative px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300
          ${currentMode === 'forecast' 
            ? 'bg-[#007AFF] text-white shadow-lg scale-105' 
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Forecast
        </span>
      </button>

      {/* Emergency Button */}
      <button
        onClick={() => onModeChange('emergency')}
        className={`
          relative px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300
          ${currentMode === 'emergency' 
            ? 'bg-[#34C759] text-white shadow-lg scale-105' 
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Emergency
        </span>
      </button>
    </div>
  );
}

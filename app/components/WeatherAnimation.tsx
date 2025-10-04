"use client";

import React, { useState } from 'react';
import type { WeatherVariable } from '@/app/types';

interface WeatherAnimationProps {
  variable: WeatherVariable;
  currentValue?: number;
  forecast?: Array<{ time: string; value: number; description: string }>;
  className?: string;
}

export default function WeatherAnimation({ 
  variable, 
  currentValue, 
  forecast = [],
  className = '' 
}: WeatherAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation configuration based on variable
  const getAnimationConfig = () => {
    switch (variable) {
      case 'precipitation':
        return {
          icon: '🌧️',
          color: '#007AFF',
          label: 'Precipitation',
          unit: 'mm',
          animation: 'rain',
        };
      case 'temperature':
        return {
          icon: '🌡️',
          color: '#FF3B30',
          label: 'Temperature',
          unit: '°C',
          animation: 'temperature',
        };
      case 'wind_speed':
        return {
          icon: '💨',
          color: '#5AC8FA',
          label: 'Wind Speed',
          unit: 'm/s',
          animation: 'wind',
        };
      case 'cloud_cover':
        return {
          icon: '☁️',
          color: '#8E8E93',
          label: 'Cloud Cover',
          unit: '%',
          animation: 'clouds',
        };
      default:
        return {
          icon: '🌤️',
          color: '#007AFF',
          label: 'Weather',
          unit: '',
          animation: 'default',
        };
    }
  };

  const config = getAnimationConfig();

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-heavy">{config.label}</h3>
            <p className="text-sm text-gray-600">Live Animation</p>
          </div>
        </div>
        
        {currentValue !== undefined && (
          <div className="text-right">
            <p className="text-3xl font-bold text-heavy" style={{ color: config.color }}>
              {currentValue.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">{config.unit}</p>
          </div>
        )}
      </div>

      {/* Animation Canvas */}
      <div className="relative h-64 bg-gradient-to-b from-blue-50 to-blue-100">
        {/* Rain Animation */}
        {config.animation === 'rain' && (
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-8 bg-blue-400 opacity-60 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Temperature Animation */}
        {config.animation === 'temperature' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-400 to-orange-500 animate-pulse" />
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-red-400 to-orange-500 opacity-50 animate-ping" />
            </div>
          </div>
        )}

        {/* Wind Animation */}
        {config.animation === 'wind' && (
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-wind"
                style={{
                  top: `${20 + i * 15}%`,
                  width: '200px',
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Clouds Animation */}
        {config.animation === 'clouds' && (
          <div className="absolute inset-0">
            <div className="absolute top-8 left-4 w-24 h-12 bg-white rounded-full opacity-80 animate-float" />
            <div className="absolute top-16 right-8 w-32 h-14 bg-white rounded-full opacity-70 animate-float-delayed" />
            <div className="absolute top-24 left-1/3 w-28 h-12 bg-white rounded-full opacity-60 animate-float-slow" />
          </div>
        )}

        {/* Play/Pause Control */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Forecast Timeline */}
      {forecast.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-3">24-Hour Forecast</h4>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {forecast.slice(0, 8).map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-20 text-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <p className="text-xs text-gray-600 mb-1">{item.time}</p>
                <p className="text-lg font-bold text-heavy" style={{ color: config.color }}>
                  {item.value.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes rain {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(400%);
            opacity: 0;
          }
        }

        @keyframes wind {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(20px) translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-15px) translateY(-8px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(10px) translateY(-15px);
          }
        }

        .animate-rain {
          animation: rain linear infinite;
        }

        .animate-wind {
          animation: wind 2s linear infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

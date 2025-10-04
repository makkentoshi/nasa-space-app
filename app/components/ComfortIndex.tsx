"use client";

import React, { useMemo } from 'react';

interface ComfortIndexProps {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  className?: string;
}

interface ComfortLevel {
  score: number; // 0-100
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Uncomfortable';
  color: string;
  emoji: string;
  recommendations: string[];
}

export default function ComfortIndex({ 
  temperature, 
  humidity, 
  windSpeed,
  className = '' 
}: ComfortIndexProps) {
  
  // Calculate comfort index based on multiple factors
  const comfortLevel = useMemo((): ComfortLevel => {
    let score = 100;
    const recommendations: string[] = [];

    // Temperature comfort (optimal: 18-24°C)
    if (temperature < 0) {
      score -= 30;
      recommendations.push('🧥 Wear warm winter clothing');
      recommendations.push('❄️ Risk of frostbite - limit outdoor time');
    } else if (temperature < 10) {
      score -= 20;
      recommendations.push('🧥 Bring a warm jacket');
    } else if (temperature < 18) {
      score -= 10;
      recommendations.push('👕 Light jacket recommended');
    } else if (temperature > 30) {
      score -= 20;
      recommendations.push('💧 Stay hydrated');
      recommendations.push('🧴 Apply sunscreen SPF 30+');
    } else if (temperature > 35) {
      score -= 35;
      recommendations.push('⚠️ Heat warning - avoid midday sun');
      recommendations.push('💧 Drink water frequently');
    }

    // Humidity comfort (optimal: 30-60%)
    if (humidity > 80) {
      score -= 15;
      recommendations.push('💨 High humidity - activities may feel harder');
    } else if (humidity < 20) {
      score -= 10;
      recommendations.push('💧 Low humidity - moisturize skin');
    }

    // Wind chill effect
    if (windSpeed > 10 && temperature < 15) {
      score -= 15;
      recommendations.push('🌬️ Strong wind chill - dress in layers');
    } else if (windSpeed > 15) {
      score -= 10;
      recommendations.push('🌬️ Windy conditions - secure loose items');
    }

    // Heat index calculation (feels-like temperature)
    const heatIndex = temperature + (0.5555 * (6.11 * Math.exp(5417.7530 * (1/273.16 - 1/(273.15 + temperature))) - 10));
    if (heatIndex > 32 && humidity > 60) {
      score -= 20;
      recommendations.push('🥵 Heat index dangerous - seek shade');
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level: ComfortLevel['level'];
    let color: string;
    let emoji: string;

    if (score >= 85) {
      level = 'Excellent';
      color = '#34C759';
      emoji = '😊';
    } else if (score >= 70) {
      level = 'Good';
      color = '#007AFF';
      emoji = '🙂';
    } else if (score >= 50) {
      level = 'Fair';
      color = '#FF9500';
      emoji = '😐';
    } else if (score >= 30) {
      level = 'Poor';
      color = '#FF3B30';
      emoji = '😟';
    } else {
      level = 'Uncomfortable';
      color = '#FF3B30';
      emoji = '😰';
    }

    // Add general recommendations
    if (score >= 85) {
      recommendations.unshift('✅ Perfect conditions for outdoor activities');
    } else if (score >= 70) {
      recommendations.unshift('👍 Good weather for most activities');
    } else if (score >= 50) {
      recommendations.unshift('⚠️ Acceptable but plan accordingly');
    }

    return { score, level, color, emoji, recommendations };
  }, [temperature, humidity, windSpeed]);

  // Calculate feels-like temperature
  const feelsLike = useMemo(() => {
    if (temperature < 10 && windSpeed > 1.3) {
      // Wind chill formula
      return 13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeed * 3.6, 0.16) + 0.3965 * temperature * Math.pow(windSpeed * 3.6, 0.16);
    } else if (temperature > 27 && humidity > 40) {
      // Heat index formula (simplified)
      return temperature + 0.5555 * ((6.11 * Math.exp(5417.7530 * (1/273.16 - 1/(273.15 + temperature))) * humidity / 100) - 10);
    }
    return temperature;
  }, [temperature, windSpeed, humidity]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Comfort Index</h3>
        <p className="text-sm opacity-90">Based on current weather conditions</p>
      </div>

      {/* Score Display */}
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Circular Progress */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={comfortLevel.color}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - comfortLevel.score / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl mb-1">{comfortLevel.emoji}</span>
              <span className="text-3xl font-bold text-heavy" style={{ color: comfortLevel.color }}>
                {comfortLevel.score}
              </span>
              <span className="text-sm text-gray-600">{comfortLevel.level}</span>
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Temperature</p>
            <p className="text-xl font-bold text-heavy">{temperature.toFixed(1)}°C</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Humidity</p>
            <p className="text-xl font-bold text-heavy">{humidity.toFixed(0)}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Wind</p>
            <p className="text-xl font-bold text-heavy">{windSpeed.toFixed(1)} m/s</p>
          </div>
        </div>

        {/* Feels Like */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Feels Like</span>
            <span className="text-2xl font-bold text-heavy">
              {feelsLike.toFixed(1)}°C
            </span>
          </div>
          {Math.abs(feelsLike - temperature) > 2 && (
            <p className="text-xs text-gray-600 mt-1">
              {feelsLike < temperature ? '🥶 Wind chill effect' : '🥵 Heat index effect'}
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h4>
          <div className="space-y-2">
            {comfortLevel.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg leading-none mt-0.5">
                  {rec.split(' ')[0]}
                </span>
                <p className="text-sm text-gray-700 flex-1">
                  {rec.split(' ').slice(1).join(' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

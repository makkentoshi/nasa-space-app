'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CloudRain, Wind, Droplets } from 'lucide-react';
import Link from 'next/link';

interface DayForecast {
  date: string;
  day_name: string;
  high_temp: number;
  low_temp: number;
  condition: string;
  emoji: string;
  precipitation_chance: number;
  wind_speed?: number;
  comfort_index?: number;
}

interface WeatherForecastCardProps {
  forecast: DayForecast[];
  location?: string;
  compact?: boolean;
  showActions?: boolean;
  onViewMore?: () => void;
}

/**
 * WeatherForecastCard Component
 * Displays 7-day compact weather forecast in chat messages
 * 
 * Features:
 * - Compact and scrollable design
 * - Weather emoji and conditions
 * - Temperature high/low
 * - Precipitation and comfort indicators
 * - Quick action buttons
 * - Responsive layout
 */
export function WeatherForecastCard({
  forecast,
  location,
  compact = false,
  showActions = true,
  onViewMore,
}: WeatherForecastCardProps) {
  const displayForecast = compact ? forecast.slice(0, 3) : forecast;
  
  return (
    <Card className="mt-3 mb-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        {/* Header */}
        {location && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {location}
            </h3>
            <Badge variant="outline" className="text-xs">
              {forecast.length} days
            </Badge>
          </div>
        )}
        
        {/* Forecast Grid */}
        <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-7'} gap-2 mb-3`}>
          {displayForecast.map((day, index) => (
            <div
              key={day.date}
              className={`
                flex flex-col items-center p-2 rounded-lg
                ${index === 0 
                  ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-400 dark:ring-blue-600' 
                  : 'bg-white/50 dark:bg-gray-800/50'
                }
                transition-all hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:scale-105
              `}
            >
              {/* Day */}
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {day.day_name}
              </div>
              
              {/* Emoji */}
              <div className="text-2xl mb-1">
                {day.emoji}
              </div>
              
              {/* Temperature */}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {day.high_temp}°
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {day.low_temp}°
                </span>
              </div>
              
              {/* Precipitation */}
              {day.precipitation_chance > 20 && (
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {day.precipitation_chance}%
                  </span>
                </div>
              )}
              
              {/* Comfort Index */}
              {day.comfort_index !== undefined && (
                <div className="mt-1">
                  <Badge
                    variant={
                      day.comfort_index >= 80 ? 'default' :
                      day.comfort_index >= 60 ? 'secondary' :
                      'destructive'
                    }
                    className="text-xs py-0 px-1"
                  >
                    {day.comfort_index}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary Row */}
        {!compact && (
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
            <div className="flex items-center gap-1">
              <CloudRain className="w-3 h-3" />
              <span>
                {forecast.filter(d => d.precipitation_chance > 50).length} rainy days
              </span>
            </div>
            {forecast[0].wind_speed && (
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                <span>Avg wind {Math.round(forecast.reduce((sum, d) => sum + (d.wind_speed || 0), 0) / forecast.length)} km/h</span>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link href="/forecast" className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                Full Forecast
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            
            {onViewMore && compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewMore}
                className="text-xs"
              >
                View All
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * WeatherSummaryCard Component
 * Simplified single-day weather display for chat
 */
interface WeatherSummaryProps {
  temp: number;
  feels_like?: number;
  condition: string;
  emoji: string;
  precipitation_chance?: number;
  wind_speed?: number;
  humidity?: number;
}

export function WeatherSummaryCard({
  temp,
  feels_like,
  condition,
  emoji,
  precipitation_chance,
  wind_speed,
  humidity,
}: WeatherSummaryProps) {
  return (
    <Card className="mt-3 mb-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Temperature */}
          <div>
            <div className="text-5xl font-bold mb-1">
              {temp}°C
            </div>
            {feels_like !== undefined && (
              <div className="text-sm opacity-90">
                Feels like {feels_like}°C
              </div>
            )}
            <div className="text-sm font-medium mt-1">
              {condition}
            </div>
          </div>
          
          {/* Right: Emoji */}
          <div className="text-6xl">
            {emoji}
          </div>
        </div>
        
        {/* Details Row */}
        {(precipitation_chance || wind_speed || humidity) && (
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/20 text-sm">
            {precipitation_chance !== undefined && (
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4" />
                <span>{precipitation_chance}%</span>
              </div>
            )}
            {wind_speed !== undefined && (
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4" />
                <span>{wind_speed} km/h</span>
              </div>
            )}
            {humidity !== undefined && (
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4" />
                <span>{humidity}%</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

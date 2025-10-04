'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RoutePreviewProps {
  from: string;
  to: string;
  from_coords?: { lat: number; lng: number };
  to_coords?: { lat: number; lng: number };
  distance?: number;
  duration?: number;
  weather_condition?: string;
  weather_emoji?: string;
  warnings?: string[];
  comfort_score?: number;
  onNavigate?: () => void;
}

/**
 * RoutePreviewCard Component
 * Displays route information in chat messages
 * Shows weather conditions along the route
 */
export function RoutePreviewCard({
  from,
  to,
  from_coords,
  to_coords,
  distance,
  duration,
  weather_condition,
  weather_emoji,
  warnings = [],
  comfort_score,
  onNavigate,
}: RoutePreviewProps) {
  const routeParams = new URLSearchParams();
  if (from_coords) {
    routeParams.set('from', from);
    routeParams.set('from_lat', from_coords.lat.toString());
    routeParams.set('from_lng', from_coords.lng.toString());
  } else {
    routeParams.set('from', from);
  }
  
  if (to_coords) {
    routeParams.set('to', to);
    routeParams.set('to_lat', to_coords.lat.toString());
    routeParams.set('to_lng', to_coords.lng.toString());
  } else {
    routeParams.set('to', to);
  }
  
  const routeUrl = `/route?${routeParams.toString()}`;
  
  return (
    <Card className="mt-3 mb-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        {/* Route Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {from}
              </span>
            </div>
            
            <div className="flex items-center gap-2 ml-6 text-gray-500 dark:text-gray-400">
              <Navigation className="w-4 h-4" />
              <ArrowRight className="w-3 h-3" />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {to}
              </span>
            </div>
          </div>
          
          {/* Weather Icon */}
          {weather_emoji && (
            <div className="text-4xl">
              {weather_emoji}
            </div>
          )}
        </div>
        
        {/* Route Details */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm">
          {distance && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Navigation className="w-3 h-3" />
              <span>{distance} km</span>
            </div>
          )}
          
          {duration && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{duration} min</span>
            </div>
          )}
          
          {weather_condition && (
            <Badge variant="outline" className="text-xs">
              {weather_condition}
            </Badge>
          )}
          
          {comfort_score !== undefined && (
            <Badge
              variant={
                comfort_score >= 80 ? 'default' :
                comfort_score >= 60 ? 'secondary' :
                'destructive'
              }
              className="text-xs"
            >
              Comfort: {comfort_score}/100
            </Badge>
          )}
        </div>
        
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1 text-xs text-amber-800 dark:text-amber-200">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="mb-1 last:mb-0">
                    • {warning}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Link href={routeUrl} className="flex-1">
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              onClick={onNavigate}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Plan Route
            </Button>
          </Link>
          
          <Link href="/forecast/map">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              View Map
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertSummaryProps {
  alerts: Array<{
    id: string;
    type: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    title: string;
    description: string;
    location?: string;
    distance_km?: number;
  }>;
  showAll?: boolean;
  onViewDetails?: (alertId: string) => void;
}

/**
 * AlertSummaryCard Component
 * Displays active alerts in chat messages
 */
export function AlertSummaryCard({
  alerts,
  showAll = false,
  onViewDetails,
}: AlertSummaryProps) {
  const displayAlerts = showAll ? alerts : alerts.slice(0, 3);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'from-red-600 to-red-700';
      case 'severe': return 'from-orange-600 to-orange-700';
      case 'moderate': return 'from-yellow-600 to-yellow-700';
      case 'minor': return 'from-blue-600 to-blue-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };
  
  const getSeverityIcon = (type: string) => {
    const icons: Record<string, string> = {
      earthquake: '🌋',
      flood: '🌊',
      storm: '⛈️',
      heat: '🔥',
      cold: '❄️',
      wind: '💨',
      rain: '🌧️',
    };
    return icons[type] || '⚠️';
  };
  
  if (alerts.length === 0) {
    return (
      <Card className="mt-3 mb-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-4 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm font-medium text-green-800 dark:text-green-200">
            No Active Alerts
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            Your area is clear of weather warnings
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-3 mb-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
            Active Alerts
          </h3>
          <Badge variant="destructive" className="text-xs">
            {alerts.length}
          </Badge>
        </div>
        
        {/* Alerts List */}
        <div className="space-y-2 mb-3">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`
                p-3 rounded-lg bg-gradient-to-r ${getSeverityColor(alert.severity)} 
                text-white shadow-md
                cursor-pointer hover:shadow-lg transition-all
              `}
              onClick={() => onViewDetails?.(alert.id)}
            >
              <div className="flex items-start gap-2">
                <div className="text-2xl">
                  {getSeverityIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {alert.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs uppercase bg-white/20"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-xs opacity-90 line-clamp-2">
                    {alert.description}
                  </p>
                  
                  {(alert.location || alert.distance_km) && (
                    <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                      {alert.location && (
                        <span>📍 {alert.location}</span>
                      )}
                      {alert.distance_km && (
                        <span>📏 {alert.distance_km.toFixed(1)} km away</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/alerts" className="flex-1">
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              View All Alerts
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          
          {!showAll && alerts.length > 3 && (
            <Badge variant="outline" className="flex items-center px-2">
              +{alerts.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

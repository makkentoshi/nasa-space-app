"use client";

import React from 'react';
import { MapPin, AlertTriangle, Navigation, Bell } from 'lucide-react';

export type EmergencyTab = 'map' | 'alerts' | 'nearby' | 'notifications';

interface EmergencyBottomBarProps {
  activeTab: EmergencyTab;
  onTabChange: (tab: EmergencyTab) => void;
  alertCount?: number;
  className?: string;
}

export default function EmergencyBottomBar({ 
  activeTab, 
  onTabChange, 
  alertCount = 0,
  className = '' 
}: EmergencyBottomBarProps) {
  const tabs: Array<{ id: EmergencyTab; icon: React.ReactNode; ariaLabel: string; badge?: number }> = [
    {
      id: 'map',
      icon: <MapPin className="w-7 h-7" />,
      ariaLabel: 'Emergency Map',
    },
    {
      id: 'alerts',
      icon: <AlertTriangle className="w-7 h-7" />,
      ariaLabel: 'Active Alerts',
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      id: 'nearby',
      icon: <Navigation className="w-7 h-7" />,
      ariaLabel: 'Nearby Resources',
    },
    {
      id: 'notifications',
      icon: <Bell className="w-7 h-7" />,
      ariaLabel: 'Notifications',
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50 ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.ariaLabel}
              className={`
                relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-[#53B175] text-white scale-110 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95'
                }
              `}
            >
              {tab.icon}
              
              {/* Badge for alerts */}
              {tab.badge && tab.badge > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
              
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#53B175] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

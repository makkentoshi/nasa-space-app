"use client";

import React from 'react';

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
  const tabs: Array<{ id: EmergencyTab; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'map',
      label: 'Map',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      id: 'nearby',
      label: 'Nearby',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 safe-bottom z-50 ${className}`}>
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-[#34C759]' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {tab.icon}
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-heavy' : ''}`}>
                {tab.label}
              </span>
              
              {/* Badge for alerts */}
              {tab.badge && tab.badge > 0 && (
                <div className="absolute top-1 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full animate-pulse">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
              
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 bg-[#34C759] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

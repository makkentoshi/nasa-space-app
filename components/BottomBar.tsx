"use client";

import React from 'react';
import { MapPin, Cloud, Heart, Sparkles, Navigation } from 'lucide-react';
import tokens from './ui/design-tokens';
import Icon from './ui/Icon';

export type ForecastTab = 'map' | 'animation' | 'comfort' | 'ai' | 'route';

interface BottomBarProps {
  activeTab: ForecastTab;
  onTabChange: (tab: ForecastTab) => void;
  className?: string;
}

export default function BottomBar({ activeTab, onTabChange, className = '' }: BottomBarProps) {
  const iconSize = tokens.icons.md;
  const tabs: Array<{ id: ForecastTab; icon: React.ReactNode; ariaLabel: string }> = [
    { id: 'map', icon: <MapPin />, ariaLabel: 'Map' },
    { id: 'animation', icon: <Cloud />, ariaLabel: 'Weather Animation' },
    { id: 'comfort', icon: <Heart />, ariaLabel: 'Comfort Index' },
    { id: 'ai', icon: <Sparkles />, ariaLabel: 'AI Assistant' },
    { id: 'route', icon: <Navigation />, ariaLabel: 'Route Assistant' },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50 ${className}`}
      style={{ height: '88px' }}
    >
      <div className="flex items-center justify-around px-3 py-3" style={{ height: '100%' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.ariaLabel}
              className={`relative flex items-center justify-center rounded-2xl transition-all duration-300`}
              style={{
                width: tokens.px(tokens.icons.lg),
                height: tokens.px(tokens.icons.lg),
                background: isActive ? tokens.colors.primary : 'transparent',
                color: isActive ? '#fff' : tokens.colors.gray500,
                boxShadow: isActive ? tokens.shadows.card : 'none',
                borderRadius: tokens.radii.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Render lucide icon with sizing */}
              <span style={{ position: 'absolute', width: tokens.px(iconSize), height: tokens.px(iconSize), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement((tab.icon as React.ReactElement) as any, { size: iconSize })}
              </span>
              {isActive && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

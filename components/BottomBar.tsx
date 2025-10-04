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
  const size = tokens.sizes.iconMd;
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
      style={{ height: tokens.sizes.bottomBarHeight || '88px' }}
    >
      <div className="flex items-center justify-around px-3 py-3" style={{ height: '100%' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeBg = 'linear-gradient(180deg, rgba(6,182,212,0.12), rgba(6,182,212,0.06))';
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.ariaLabel}
              className={`relative flex items-center justify-center rounded-2xl transition-all duration-300`}
              style={{
                width: tokens.sizes.iconLg,
                height: tokens.sizes.iconLg,
                background: isActive ? tokens.colors.primary : 'transparent',
                color: isActive ? '#fff' : tokens.colors.muted,
                boxShadow: isActive ? tokens.shadows.md : 'none',
                borderRadius: tokens.radii.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={tokens.sizes.iconMd} color={isActive ? '#fff' : tokens.colors.muted}>
                {/* If lucide icon is passed we render it inside Icon via children (not used here) */}
              </Icon>
              {/* Fallback: render lucide icon with sizing */}
              <span style={{ position: 'absolute', width: tokens.sizes.iconMd, height: tokens.sizes.iconMd, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement((tab.icon as React.ReactElement) as any, { size: parseInt(tokens.sizes.iconMd, 10) || 28 })}
              </span>
              {isActive && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

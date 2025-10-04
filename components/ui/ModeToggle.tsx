"use client"

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Cloud, Shield, Thermometer, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type AppMode = 'emergency' | 'forecast'

interface ModeToggleProps {
  onModeChange?: (mode: AppMode) => void
  className?: string
}

export function ModeToggle({ onModeChange, className }: ModeToggleProps) {
  const [mode, setMode] = useState<AppMode>('emergency')
  const router = useRouter()

  // Load saved mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('resq-app-mode') as AppMode
    if (savedMode && (savedMode === 'emergency' || savedMode === 'forecast')) {
      setMode(savedMode)
    }
  }, [])

  // Save mode to localStorage and notify parent
  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    localStorage.setItem('resq-app-mode', newMode)
    onModeChange?.(newMode)
    
    // Navigate to appropriate home page
    if (newMode === 'forecast') {
      router.push('/forecast')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm ${className}`}>
      {/* Emergency Mode */}
      <div className={`flex items-center gap-2 transition-opacity ${mode === 'emergency' ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex items-center gap-1">
          <Shield size={16} className="text-red-500" />
          <AlertTriangle size={14} className="text-orange-500" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Emergency
        </span>
      </div>

      {/* Toggle Switch */}
      <Switch
        checked={mode === 'forecast'}
        onCheckedChange={(checked) => handleModeChange(checked ? 'forecast' : 'emergency')}
        className="data-[state=checked]:bg-blue-500"
      />

      {/* Forecast Mode */}
      <div className={`flex items-center gap-2 transition-opacity ${mode === 'forecast' ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex items-center gap-1">
          <Cloud size={16} className="text-blue-500" />
          <Thermometer size={14} className="text-green-500" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Forecast
        </span>
      </div>
    </div>
  )
}

// Hook to get current app mode
export function useAppMode(): [AppMode, (mode: AppMode) => void] {
  const [mode, setMode] = useState<AppMode>('emergency')

  useEffect(() => {
    const savedMode = localStorage.getItem('resq-app-mode') as AppMode
    if (savedMode && (savedMode === 'emergency' || savedMode === 'forecast')) {
      setMode(savedMode)
    }
  }, [])

  const updateMode = (newMode: AppMode) => {
    setMode(newMode)
    localStorage.setItem('resq-app-mode', newMode)
  }

  return [mode, updateMode]
}
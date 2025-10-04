"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  Location,
  WeatherVariable,
  BasePeriod,
  StatisticsResponse,
  ForecastState,
  AIState,
} from '@/app/types';
import { fetchForecastStatistics, queryAI } from '@/app/lib/api';

interface ForecastContextType {
  // State
  forecastState: ForecastState;
  aiState: AIState;
  
  // Actions
  setLocation: (location: Location) => void;
  setDayOfYear: (day: number) => void;
  setWindowDays: (days: number) => void;
  setVariable: (variable: WeatherVariable) => void;
  setThreshold: (threshold: number | undefined) => void;
  setBaselinePeriod: (period: BasePeriod) => void;
  setRecentPeriod: (period: BasePeriod) => void;
  
  // API calls
  loadStatistics: () => Promise<void>;
  askAI: (query: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

const initialForecastState: ForecastState = {
  day_of_year: 180, // June 29
  window_days: 3,
  variable: 'precipitation',
  baseline_period: { start_year: 2001, end_year: 2015 },
  recent_period: { start_year: 2016, end_year: 2023 },
  loading: false,
};

const initialAIState: AIState = {
  query: '',
  loading: false,
};

export function ForecastProvider({ children }: { children: ReactNode }) {
  const [forecastState, setForecastState] = useState<ForecastState>(initialForecastState);
  const [aiState, setAIState] = useState<AIState>(initialAIState);

  const setLocation = useCallback((location: Location) => {
    setForecastState((prev) => ({ ...prev, location }));
  }, []);

  const setDayOfYear = useCallback((day: number) => {
    setForecastState((prev) => ({ ...prev, day_of_year: day }));
  }, []);

  const setWindowDays = useCallback((days: number) => {
    setForecastState((prev) => ({ ...prev, window_days: days }));
  }, []);

  const setVariable = useCallback((variable: WeatherVariable) => {
    setForecastState((prev) => ({ ...prev, variable }));
  }, []);

  const setThreshold = useCallback((threshold: number | undefined) => {
    setForecastState((prev) => ({ ...prev, threshold }));
  }, []);

  const setBaselinePeriod = useCallback((period: BasePeriod) => {
    setForecastState((prev) => ({ ...prev, baseline_period: period }));
  }, []);

  const setRecentPeriod = useCallback((period: BasePeriod) => {
    setForecastState((prev) => ({ ...prev, recent_period: period }));
  }, []);

  const loadStatistics = useCallback(async () => {
    const { location, day_of_year, window_days, variable, threshold, baseline_period, recent_period } = forecastState;
    
    if (!location) {
      setForecastState((prev) => ({ ...prev, error: 'Please select a location on the map' }));
      return;
    }

    setForecastState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const statistics = await fetchForecastStatistics({
        lat: location.lat,
        lon: location.lon,
        day_of_year,
        window_days,
        variable,
        threshold,
        baseline_period,
        recent_period,
      });

      setForecastState((prev) => ({ ...prev, statistics, loading: false }));
    } catch (error) {
      setForecastState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load statistics',
      }));
    }
  }, [forecastState]);

  const askAI = useCallback(async (query: string) => {
    const { location, day_of_year, window_days, variable, threshold } = forecastState;

    if (!location) {
      setAIState((prev) => ({ ...prev, error: 'Please select a location first' }));
      return;
    }

    setAIState({ query, loading: true, error: undefined });

    try {
      const response = await queryAI({
        user_query: query,
        location,
        day_of_year,
        window_days,
        variables: [variable],
        thresholds: threshold ? ({ [variable]: threshold } as Record<WeatherVariable, number>) : undefined,
        language: 'en',
      });

      setAIState({ query, response, loading: false });
    } catch (error) {
      setAIState({
        query,
        loading: false,
        error: error instanceof Error ? error.message : 'AI query failed',
      });
    }
  }, [forecastState]);

  const reset = useCallback(() => {
    setForecastState(initialForecastState);
    setAIState(initialAIState);
  }, []);

  return (
    <ForecastContext.Provider
      value={{
        forecastState,
        aiState,
        setLocation,
        setDayOfYear,
        setWindowDays,
        setVariable,
        setThreshold,
        setBaselinePeriod,
        setRecentPeriod,
        loadStatistics,
        askAI,
        reset,
      }}
    >
      {children}
    </ForecastContext.Provider>
  );
}

export function useForecast() {
  const context = useContext(ForecastContext);
  if (!context) {
    throw new Error('useForecast must be used within ForecastProvider');
  }
  return context;
}

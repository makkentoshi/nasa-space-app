import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  location: { lat: number; lng: number } | null
  locationName: string | null
  accuracy: number | null
  timestamp: number | null
  isTracking: boolean
}

interface AppState {
  // Location
  location: LocationState
  setLocation: (location: { lat: number; lng: number }, accuracy?: number, locationName?: string) => void
  setLocationName: (locationName: string) => void
  setTracking: (isTracking: boolean) => void
  
  // Offline state
  isOnline: boolean
  setOnlineStatus: (isOnline: boolean) => void
  
  // Accessibility preferences
  a11yPrefs: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    screenReader: boolean
  }
  setA11yPref: <K extends keyof AppState['a11yPrefs']>(key: K, value: AppState['a11yPrefs'][K]) => void
  
  // Emergency state
  isInEmergency: boolean
  setEmergencyState: (isInEmergency: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Location state
      location: {
        location: null,
        locationName: null,
        accuracy: null,
        timestamp: null,
        isTracking: false
      },
      setLocation: (location, accuracy, locationName) => 
        set((state) => ({
          location: {
            ...state.location,
            location,
            accuracy: accuracy || null,
            locationName: locationName || null,
            timestamp: Date.now()
          }
        })),
      setLocationName: (locationName) =>
        set((state) => ({
          location: {
            ...state.location,
            locationName
          }
        })),
      setTracking: (isTracking) =>
        set((state) => ({
          location: {
            ...state.location,
            isTracking
          }
        })),
      
      // Online state
      isOnline: true,
      setOnlineStatus: (isOnline) => set({ isOnline }),
      
      // Accessibility preferences
      a11yPrefs: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false
      },
      setA11yPref: (key, value) =>
        set((state) => ({
          a11yPrefs: {
            ...state.a11yPrefs,
            [key]: value
          }
        })),
      
      // Emergency state
      isInEmergency: false,
      setEmergencyState: (isInEmergency) => set({ isInEmergency })
    }),
    {
      name: 'resq-app-store',
      partialize: (state) => ({
        a11yPrefs: state.a11yPrefs,
        location: {
          ...state.location,
          isTracking: false // Don't persist tracking state
        }
      })
    }
  )
)
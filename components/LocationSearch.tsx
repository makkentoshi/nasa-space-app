"use client"

import { useState, useEffect } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchLocations, LocationResult } from '@/lib/geocoding'
import { useAppStore } from '@/lib/store/useAppStore'

interface LocationSearchProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect?: (location: LocationResult) => void
}

export default function LocationSearch({ isOpen, onClose, onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { setLocation, setLocationName } = useAppStore()

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        try {
          const locations = await searchLocations(query)
          setResults(locations)
        } catch (error) {
          console.error('Search failed:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [query])

  const handleLocationSelect = (location: LocationResult) => {
    setLocation({ lat: location.lat, lng: location.lng }, undefined, location.name)
    setLocationName(location.name)
    
    if (onLocationSelect) {
      onLocationSelect(location)
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl mx-4 w-full max-w-md shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Search Location</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a city or region..."
              className="pl-10"
              autoFocus
            />
          </div>
          
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}
          
          {results.length > 0 && (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {results.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{location.name}</div>
                      {location.region && (
                        <div className="text-sm text-gray-500">{location.region}</div>
                      )}
                      <div className="text-xs text-gray-400">{location.country}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="mt-4 text-center py-8">
              <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No locations found</p>
              <p className="text-xs text-gray-400">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
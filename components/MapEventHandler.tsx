"use client"

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface MapEventHandlerProps {
  onMapClick: (e: L.LeafletMouseEvent) => void
}

const MapEventHandler = ({ onMapClick }: MapEventHandlerProps) => {
  const map = useMap()
  
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e)
    }
    
    map.on('click', handleClick)
    
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onMapClick])
  
  return null
}

export default MapEventHandler
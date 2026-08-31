'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import SearchBarControl from '@/app/components/SearchBarControl'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function Square(props) {
  const context = useLeafletContext()

  useEffect(() => {
    const bounds = L.latLng(props.center).toBounds(props.size)
    const square = new L.Rectangle(bounds)
    const container = context.layerContainer || context.map
    container.addLayer(square)

    return () => {
      container.removeLayer(square)
    }
  })

  return null
}

export default function MyMap({ onSelect, selectedPosition, autoSelectCurrentLocation = false }) {
  const [position, setPosition] = useState([12.1364, -86.2514])

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const newPosition = [coords.latitude, coords.longitude];
          setPosition(newPosition);
          if (autoSelectCurrentLocation && onSelect) {
            onSelect(newPosition);
          }
        },
        (err) => console.warn('Error obteniendo ubicación:', err)
      )
    }
  }, [autoSelectCurrentLocation, onSelect])

  function ClickHandler() {
    useMapEvents({
      click(e) {
        onSelect && onSelect([e.latlng.lat, e.latlng.lng])
      }
    })
    return null
  }

  return (
    <MapContainer
      center={position}
      zoom={20}
      style={{ height: 'min(70vh, 34rem)', width: '100%' }}
      maxBounds={[
        [12.0, -86.35],
        [12.25, -86.15]
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SearchBarControl />
      <Square center={[12.1364, -86.2514]} size={5000} />
      <ClickHandler />
      {selectedPosition && <Marker position={selectedPosition} />}
    </MapContainer>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useLeafletContext } from '@react-leaflet/core'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import SearchBarControl from '@/app/components/SearchBarControl'

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
  }, [context, props.center, props.size])

  return null
}

export default function MyMapClient() {
  const [position, setPosition] = useState([12.1364, -86.2514])

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setPosition([latitude, longitude])
        },
        (err) => {
          console.warn('Error obteniendo ubicación:', err)
        }
      )
    }
  }, [])

  return (
    <MapContainer
      center={position}
      zoom={20}
      style={{ height: '100vh', width: '100%' }}
      maxBounds={[
        [12.0, -86.35],
        [12.25, -86.15],
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <SearchBarControl />
      <Square center={[12.1364, -86.2514]} size={5000} />
    </MapContainer>
  )
}
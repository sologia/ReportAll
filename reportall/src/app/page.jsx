'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import SearchBarControl from '../../frontend/components/searchcontrol/search'

// leaflet no carga automáticamente las imágenes del marcador en webpack/Next
// hay que configurar la url para que apunten a los assets correctos.
// sin esto el icono aparece vacío o no se muestra.
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

function MyMap({ onSelect, selectedPosition }) {
  const [position, setPosition] = useState([12.1364, -86.2514]) // fallback Managua

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setPosition([coords.latitude, coords.longitude]),
        (err) => console.warn('Error obteniendo ubicación:', err)
      )
    }
  }, [])

  function ClickHandler() {
    useMapEvents({
      click(e) {
        // notifica al padre con latitud y longitud
        onSelect && onSelect([e.latlng.lat, e.latlng.lng])
      }
    })
    return null
  }

  return (
    <MapContainer
      center={position}
      zoom={20}
      style={{ height: '100vh', width: '100%' }}
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

export default MyMap
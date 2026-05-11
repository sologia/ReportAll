'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import SearchBarControl from '../../../frontend/components/searchcontrol/search'
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

function MapController({ selectedPosition, currentLocation }) {
  const map = useMap()

  useEffect(() => {
    const target =
      selectedPosition && selectedPosition.length === 2
        ? selectedPosition
        : currentLocation && currentLocation.length === 2
          ? currentLocation
          : null

    if (target) {
      map.setView(target, 20)
    }
  }, [map, selectedPosition, currentLocation])

  return null
}

function formatCoordinates(position) {
  if (!position || position.length !== 2) return 'N/D'
  return `Lat: ${position[0]}, Lng: ${position[1]}`
}

export default function MyMap({ onSelect, selectedPosition, currentLocation }) {
  const [position] = useState([12.1364, -86.2514])

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
      <MapController selectedPosition={selectedPosition} currentLocation={currentLocation} />
      <ClickHandler />
      {currentLocation && (
        <Marker position={currentLocation} icon={L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [41, 41] })}>
          <Popup>
            <div className='text-sm'>
              <p><strong>Tipo:</strong> Mi ubicación actual</p>
              <p><strong>Coordenadas:</strong> {formatCoordinates(currentLocation)}</p>
              <p><strong>Marcador:</strong> Azul</p>
            </div>
          </Popup>
        </Marker>
      )}
      {selectedPosition && (
        <Marker position={selectedPosition} icon={L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [41, 41] })}>
          <Popup>
            <div className='text-sm'>
              <p><strong>Tipo:</strong> Ubicación del problema</p>
              <p><strong>Coordenadas:</strong> {formatCoordinates(selectedPosition)}</p>
              <p><strong>Marcador:</strong> Rojo</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

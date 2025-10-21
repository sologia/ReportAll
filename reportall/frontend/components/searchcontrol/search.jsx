'use client'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'

function SearchBarControl() {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider()

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true
    })

    map.addControl(searchControl)

    return () => map.removeControl(searchControl)
  }, [map])

  return null
}

export default SearchBarControl;
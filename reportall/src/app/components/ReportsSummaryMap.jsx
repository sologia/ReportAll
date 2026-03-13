'use client'

import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return

    if (points.length === 1) {
      map.setView(points[0], 16)
      return
    }

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [30, 30] })
  }, [map, points])

  return null
}

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('es-NI')
}

const parseCoordinate = (value) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return Number.NaN

  const normalized = value.trim().replace(',', '.')
  return Number(normalized)
}

export default function ReportsSummaryMap({ reports = [] }) {
  const normalizedReports = useMemo(() => {
    return reports
      .map((item) => {
        const latitude = parseCoordinate(item?.Y)
        const longitude = parseCoordinate(item?.X)

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null
        }

        return {
          ...item,
          latitude,
          longitude,
        }
      })
      .filter(Boolean)
  }, [reports])

  const points = useMemo(
    () => normalizedReports.map((item) => [item.latitude, item.longitude]),
    [normalizedReports],
  )

  return (
    <MapContainer
      center={[12.1364, -86.2514]}
      zoom={13}
      style={{ height: '70vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <FitBounds points={points} />

      {normalizedReports.map((report) => (
        <Marker key={report.Report_ID} position={[report.latitude, report.longitude]}>
          <Tooltip direction='top' offset={[0, -10]} opacity={1}>
            <div className='text-sm'>
              <p><strong>Reporte:</strong> #{report.Report_ID}</p>
              <p><strong>Problema:</strong> {report.Name_Problem || 'N/D'}</p>
              <p><strong>Urgencia:</strong> {report.Urgency || 'N/D'}</p>
              <p><strong>Dirección:</strong> {report.Adress || 'N/D'}</p>
              <p><strong>Distrito:</strong> {report.District || 'N/D'}</p>
              <p><strong>Estado:</strong> {report.State || 'N/D'}</p>
              <p><strong>Fecha:</strong> {formatDate(report.Report_Date)}</p>
              <p><strong>Cuadrilla:</strong> {report.Num_Crew ?? 'Sin asignar'}</p>
              <p><strong>Líder:</strong> {report.Name_Leader || 'Sin asignar'}</p>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}

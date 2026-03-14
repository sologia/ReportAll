'use client'

import {
  CircleMarker,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

const normalizeState = (value) => {
  if (!value || typeof value !== 'string') return 'Sin estado'
  return value.trim() || 'Sin estado'
}

const getStateColor = (state) => {
  const normalized = normalizeState(state).toLowerCase()

  if (normalized.includes('recib')) return '#facc15'
  if (normalized.includes('problema')) return '#ef4444'
  if (normalized.includes('proceso') || normalized.includes('curso')) return '#3b82f6'
  if (normalized.includes('terminad') || normalized.includes('resuelto') || normalized.includes('complet')) {
    return '#10b981'
  }

  return '#6b7280'
}

const isPointInsidePolygon = (point, polygon) => {
  const [x, y] = point
  let isInside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi

    if (intersect) {
      isInside = !isInside
    }
  }

  return isInside
}

function PolygonSelector({ onAddPoint }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng
      onAddPoint([lat, lng])
    },
  })

  return null
}

export default function ReportsSummaryMap({ reports = [] }) {
  const [selectedState, setSelectedState] = useState('Todos')
  const [polygonPoints, setPolygonPoints] = useState([])

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
          normalizedState: normalizeState(item?.State),
        }
      })
      .filter(Boolean)
  }, [reports])

  const availableStates = useMemo(() => {
    return Array.from(new Set(normalizedReports.map((item) => item.normalizedState))).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    )
  }, [normalizedReports])

  const filteredReports = useMemo(() => {
    if (selectedState === 'Todos') return normalizedReports
    return normalizedReports.filter((item) => item.normalizedState === selectedState)
  }, [normalizedReports, selectedState])

  const points = useMemo(
    () => filteredReports.map((item) => [item.latitude, item.longitude]),
    [filteredReports],
  )

  const isPolygonClosed = polygonPoints.length >= 3

  const reportsInsideArea = useMemo(() => {
    if (!isPolygonClosed) return []

    return filteredReports.filter((report) =>
      isPointInsidePolygon([report.latitude, report.longitude], polygonPoints),
    )
  }, [filteredReports, isPolygonClosed, polygonPoints])

  const countsByStateInsideArea = useMemo(() => {
    return reportsInsideArea.reduce((accumulator, report) => {
      const state = report.normalizedState
      accumulator[state] = (accumulator[state] || 0) + 1
      return accumulator
    }, {})
  }, [reportsInsideArea])

  const sortedStateCounts = useMemo(() => {
    return Object.entries(countsByStateInsideArea).sort(([stateA], [stateB]) =>
      stateA.localeCompare(stateB, 'es', { sensitivity: 'base' }),
    )
  }, [countsByStateInsideArea])

  const addPolygonPoint = (point) => {
    setPolygonPoints((previous) => [...previous, point])
  }

  const clearPolygon = () => {
    setPolygonPoints([])
  }

  const handleStateChange = (event) => {
    setSelectedState(event.target.value)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div>
          <label className='block text-sm font-medium mb-1'>Filtrar por estado</label>
          <select
            className='border rounded px-3 py-2 text-sm min-w-52'
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value='Todos'>Todos</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <button
          type='button'
          onClick={clearPolygon}
          className='border rounded px-3 py-2 text-sm'
        >
          Limpiar área seleccionada
        </button>

        <p className='text-sm text-gray-600'>Haz clic en el mapa para agregar vértices del polígono.</p>
      </div>

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
        <PolygonSelector onAddPoint={addPolygonPoint} />

        {isPolygonClosed && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{
              color: '#0ea5e9',
              fillColor: '#0ea5e9',
              fillOpacity: 0.18,
              weight: 2,
              interactive: false,
            }}
          />
        )}

        {filteredReports.map((report) => (
          <CircleMarker
            key={report.Report_ID}
            center={[report.latitude, report.longitude]}
            radius={7}
            pathOptions={{
              color: getStateColor(report.normalizedState),
              fillColor: getStateColor(report.normalizedState),
              fillOpacity: 0.9,
              weight: 1,
            }}
          >
            <Tooltip direction='top' offset={[0, -10]} opacity={1}>
              <div className='text-sm'>
                <p><strong>Reporte:</strong> #{report.Report_ID}</p>
                <p><strong>Problema:</strong> {report.Name_Problem || 'N/D'}</p>
                <p><strong>Urgencia:</strong> {report.Urgency || 'N/D'}</p>
                <p><strong>Dirección:</strong> {report.Adress || 'N/D'}</p>
                <p><strong>Distrito:</strong> {report.District || 'N/D'}</p>
                <p><strong>Estado:</strong> {report.normalizedState}</p>
                <p><strong>Fecha:</strong> {formatDate(report.Report_Date)}</p>
                <p><strong>Cuadrilla:</strong> {report.Num_Crew ?? 'Sin asignar'}</p>
                <p><strong>Líder:</strong> {report.Name_Leader || 'Sin asignar'}</p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className='border rounded p-3 text-sm space-y-2'>
        <p><strong>Reportes visibles en mapa:</strong> {filteredReports.length}</p>
        <p><strong>Reportes dentro del área seleccionada:</strong> {reportsInsideArea.length}</p>

        {isPolygonClosed ? (
          sortedStateCounts.length ? (
            <div>
              <p className='font-medium mb-1'>Conteo por estado dentro del polígono:</p>
              <ul className='list-disc list-inside'>
                {sortedStateCounts.map(([state, count]) => (
                  <li key={state}>{state}: {count}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No hay reportes dentro del área seleccionada.</p>
          )
        ) : (
          <p>Agrega al menos 3 puntos para cerrar el polígono y ver el conteo del área.</p>
        )}
      </div>
    </div>
  )
}

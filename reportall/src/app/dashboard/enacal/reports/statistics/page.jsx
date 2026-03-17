'use client'

import { useEffect, useMemo, useState } from 'react'
import ButtonGroup from '@/app/components/ButtonGroup '
import { getSession } from '@/lib/auth'
import { normalizeRole } from '@/lib/rbac'

const numberFormatter = new Intl.NumberFormat('es-NI')

const colorByState = (state) => {
  const normalized = String(state || '').toLowerCase()
  if (normalized.includes('recib')) return '#facc15'
  if (normalized.includes('problema')) return '#ef4444'
  if (normalized.includes('proceso')) return '#3b82f6'
  if (normalized.includes('terminad') || normalized.includes('resuelt') || normalized.includes('complet')) return '#10b981'
  return '#6b7280'
}

const fallbackPalette = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f97316', '#ef4444', '#84cc16', '#ec4899']

function KpiCard({ title, value, subtitle }) {
  return (
    <div className='rounded-xl border bg-white p-4 shadow-sm'>
      <p className='text-sm text-gray-600'>{title}</p>
      <p className='text-2xl font-semibold'>{value}</p>
      {subtitle ? <p className='text-xs text-gray-500 mt-1'>{subtitle}</p> : null}
    </div>
  )
}

function HorizontalBarChart({ title, data, getColor }) {
  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0)

  return (
    <div className='rounded-xl border bg-white p-4 shadow-sm'>
      <h3 className='font-semibold mb-3'>{title}</h3>
      {data.length === 0 ? (
        <p className='text-sm text-gray-500'>Sin datos para graficar.</p>
      ) : (
        <div className='space-y-3'>
          {data.map((item, index) => {
            const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0
            const color = getColor ? getColor(item.label, index) : fallbackPalette[index % fallbackPalette.length]

            return (
              <div key={`${item.label}-${index}`}>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='font-medium truncate pr-2'>{item.label}</span>
                  <span>{numberFormatter.format(item.value)}</span>
                </div>
                <div className='h-3 rounded-full bg-gray-100 overflow-hidden'>
                  <div
                    className='h-3 rounded-full'
                    style={{ width: `${Math.max(width, 2)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DonutChart({ title, total, segments }) {
  const validSegments = segments.filter((segment) => segment.value > 0)
  const gradient = validSegments.length
    ? (() => {
        let start = 0
        const parts = validSegments.map((segment, index) => {
          const value = total > 0 ? (segment.value / total) * 100 : 0
          const end = start + value
          const color = segment.color || fallbackPalette[index % fallbackPalette.length]
          const part = `${color} ${start}% ${end}%`
          start = end
          return part
        })
        return `conic-gradient(${parts.join(', ')})`
      })()
    : 'conic-gradient(#e5e7eb 0% 100%)'

  return (
    <div className='rounded-xl border bg-white p-4 shadow-sm'>
      <h3 className='font-semibold mb-3'>{title}</h3>
      <div className='flex flex-col lg:flex-row gap-4 items-center'>
        <div className='relative w-44 h-44 rounded-full' style={{ background: gradient }}>
          <div className='absolute inset-8 rounded-full bg-white flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-xs text-gray-500'>Total</p>
              <p className='text-lg font-semibold'>{numberFormatter.format(total)}</p>
            </div>
          </div>
        </div>

        <div className='w-full space-y-2'>
          {validSegments.length === 0 ? (
            <p className='text-sm text-gray-500'>Sin datos para graficar.</p>
          ) : (
            validSegments.map((segment, index) => (
              <div key={`${segment.label}-${index}`} className='flex justify-between items-center text-sm'>
                <span className='flex items-center gap-2'>
                  <span
                    className='inline-block w-3 h-3 rounded-full'
                    style={{ backgroundColor: segment.color || fallbackPalette[index % fallbackPalette.length] }}
                  />
                  {segment.label}
                </span>
                <span>{numberFormatter.format(segment.value)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportsStatisticsPage() {
  const role = normalizeRole(getSession()?.role)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [districtOptions, setDistrictOptions] = useState([])
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    district: '',
  })

  const base = process.env.NEXT_PUBLIC_API_URL || ''

  const loadStats = async (activeFilters = filters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeFilters.dateFrom) params.append('dateFrom', activeFilters.dateFrom)
      if (activeFilters.dateTo) params.append('dateTo', activeFilters.dateTo)
      if (activeFilters.district) params.append('district', activeFilters.district)

      const query = params.toString()
      const response = await fetch(`${base}/api/reports/statistics${query ? `?${query}` : ''}`)
      const result = await response.json()
      setStats(result && typeof result === 'object' ? result : null)
    } catch (error) {
      console.error('Error cargando estadísticas de reportes', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()

    fetch(`${base}/api/sectors`)
      .then((res) => res.json())
      .then((raw) => setDistrictOptions(Array.isArray(raw) ? raw : []))
      .catch((err) => {
        console.error('Error cargando distritos', err)
        setDistrictOptions([])
      })
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  const handleApplyFilters = (event) => {
    event.preventDefault()
    loadStats(filters)
  }

  const handleClearFilters = () => {
    const reset = { dateFrom: '', dateTo: '', district: '' }
    setFilters(reset)
    loadStats(reset)
  }

  const topCrews = useMemo(() => {
    const rows = stats?.crews?.ranking || []
    return rows.slice(0, 10)
  }, [stats])

  const overview = stats?.overview || {
    totalReports: 0,
    totalAssigned: 0,
    totalSolved: 0,
    assignmentRate: 0,
    solvedRate: 0,
  }

  const crewAverages = stats?.crews?.averages || {
    totalCrews: 0,
    activeCrews: 0,
    avgAssigned: 0,
    avgSolved: 0,
    avgSolveRate: 0,
  }

  const stateData = stats?.charts?.byState || []
  const urgencyData = stats?.charts?.byUrgency || []
  const problemData = stats?.charts?.byProblem || []

  const donutSegments = stateData.map((item) => ({
    ...item,
    color: colorByState(item.label),
  }))

  const navButtons = role === 'director_it'
    ? [
      { label: 'Resumen IT', href: '/dashboard/enacal/reports/summary' },
      { label: 'Resumen cuadrillas', href: '/dashboard/enacal/craw/report-summary' },
      { label: 'Mapa de Reportes', href: '/dashboard/enacal/reports/summary/map' },
      { label: 'Menu', href: '/dashboard/enacal' },
    ]
    : [
      { label: 'Resumen IT', href: '/dashboard/enacal/reports/summary' },
      { label: 'Mapa de Reportes', href: '/dashboard/enacal/reports/summary/map' },
      { label: 'Ver Reportes', href: '/dashboard/enacal/reports/viewreports' },
      { label: 'Menu', href: '/dashboard/enacal' },
    ]

  return (
    <div className='space-y-6'>
      <ButtonGroup
        buttons={navButtons}
      />

      <h2 className='text-2xl font-semibold'>Estadísticas de Reportes y Cuadrillas</h2>

      <form onSubmit={handleApplyFilters} className='flex flex-wrap gap-4 items-end'>
        <div className='flex flex-col'>
          <label htmlFor='dateFrom'>Fecha desde</label>
          <input
            id='dateFrom'
            name='dateFrom'
            type='date'
            value={filters.dateFrom}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          />
        </div>

        <div className='flex flex-col'>
          <label htmlFor='dateTo'>Fecha hasta</label>
          <input
            id='dateTo'
            name='dateTo'
            type='date'
            value={filters.dateTo}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          />
        </div>

        <div className='flex flex-col'>
          <label htmlFor='district'>Distrito</label>
          <select
            id='district'
            name='district'
            value={filters.district}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          >
            <option value=''>Todos</option>
            {districtOptions.map((item, idx) => (
              <option key={`${item.Name_Sector}-${idx}`} value={item.Name_Sector}>{item.Name_Sector}</option>
            ))}
          </select>
        </div>

        <button type='submit' className='bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition'>
          Analizar
        </button>

        <button
          type='button'
          onClick={handleClearFilters}
          className='bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition'
        >
          Limpiar
        </button>
      </form>

      {loading ? (
        <p>Cargando estadísticas...</p>
      ) : (
        <>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
            <KpiCard title='Reportes totales' value={numberFormatter.format(overview.totalReports)} />
            <KpiCard title='Reportes asignados' value={numberFormatter.format(overview.totalAssigned)} subtitle={`${overview.assignmentRate}% del total`} />
            <KpiCard title='Reportes solucionados' value={numberFormatter.format(overview.totalSolved)} subtitle={`${overview.solvedRate}% del total`} />
            <KpiCard title='Promedio asignadas por cuadrilla activa' value={crewAverages.avgAssigned} subtitle={`${crewAverages.activeCrews} cuadrillas activas`} />
            <KpiCard title='Promedio solucionadas por cuadrilla activa' value={crewAverages.avgSolved} subtitle={`Efectividad promedio ${crewAverages.avgSolveRate}%`} />
          </div>

          <div className='grid gap-4 xl:grid-cols-2'>
            <DonutChart title='Distribución de reportes por estado' total={overview.totalReports} segments={donutSegments} />
            <HorizontalBarChart
              title='Top problemas más reportados'
              data={problemData}
            />
          </div>

          <div className='grid gap-4 xl:grid-cols-2'>
            <HorizontalBarChart
              title='Reportes por urgencia'
              data={urgencyData}
            />
            <HorizontalBarChart
              title='Top cuadrillas por asignaciones'
              data={topCrews.map((crew) => ({
                label: `Cuadrilla ${crew.Num_Crew}`,
                value: crew.Assigned_Total,
                solved: crew.Solved_Total,
              }))}
            />
          </div>

          <div className='rounded-xl border bg-white p-4 shadow-sm overflow-x-auto'>
            <h3 className='font-semibold mb-3'>Detalle estadístico por cuadrilla</h3>
            <table className='min-w-full border-collapse'>
              <thead className='bg-blue-600 text-white'>
                <tr>
                  <th className='py-3 px-4 text-left text-sm font-medium'>Cuadrilla</th>
                  <th className='py-3 px-4 text-left text-sm font-medium'>Distrito</th>
                  <th className='py-3 px-4 text-left text-sm font-medium'>Asignadas</th>
                  <th className='py-3 px-4 text-left text-sm font-medium'>Solucionadas</th>
                  <th className='py-3 px-4 text-left text-sm font-medium'>Pendientes</th>
                  <th className='py-3 px-4 text-left text-sm font-medium'>Tasa solución</th>
                </tr>
              </thead>
              <tbody>
                {topCrews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center py-4 text-gray-500'>No hay datos de cuadrillas con estos filtros.</td>
                  </tr>
                ) : (
                  topCrews.map((crew) => (
                    <tr key={crew.Crew_ID} className='border-b hover:bg-blue-50 transition'>
                      <td className='py-3 px-4 text-sm text-gray-700'>{crew.Num_Crew}</td>
                      <td className='py-3 px-4 text-sm text-gray-700'>{crew.District}</td>
                      <td className='py-3 px-4 text-sm text-gray-700'>{numberFormatter.format(crew.Assigned_Total)}</td>
                      <td className='py-3 px-4 text-sm text-gray-700'>{numberFormatter.format(crew.Solved_Total)}</td>
                      <td className='py-3 px-4 text-sm text-gray-700'>{numberFormatter.format(crew.Pending_Total)}</td>
                      <td className='py-3 px-4 text-sm text-gray-700'>{crew.Solve_Rate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

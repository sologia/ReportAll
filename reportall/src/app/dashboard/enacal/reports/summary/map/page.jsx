'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ButtonGroup from '@/app/components/ButtonGroup '
import { getSession } from '@/lib/auth'
import { canViewIds, normalizeRole } from '@/lib/rbac'

const ReportsSummaryMap = dynamic(() => import('@/app/components/ReportsSummaryMap'), { ssr: false })

const SummaryMapPage = () => {
  const role = normalizeRole(getSession()?.role)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const base = process.env.NEXT_PUBLIC_API_URL || ''

  useEffect(() => {
    const loadMapReports = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${base}/api/reports/summary-map`)
        const result = await response.json()
        setReports(Array.isArray(result) ? result : [])
      } catch (error) {
        console.error('Error cargando puntos del mapa de reportes', error)
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    loadMapReports()
  }, [base])

  const navButtons = role === 'director_it'
    ? [
      { label: 'Resumen IT', href: '/dashboard/enacal/reports/summary' },
      { label: 'Resumen cuadrillas', href: '/dashboard/enacal/craw/report-summary' },
      { label: 'Estadísticas', href: '/dashboard/enacal/reports/statistics' },
      { label: 'Menu', href: '/dashboard/enacal' },
    ]
    : [
      { label: 'Estadísticas', href: '/dashboard/enacal/reports/statistics' },
      { label: 'Resumen IT', href: '/dashboard/enacal/reports/summary' },
      { label: 'Ver Reportes', href: '/dashboard/enacal/reports/viewreports' },
      { label: 'Menu', href: '/dashboard/enacal' },
    ]

  return (
    <div>
      <ButtonGroup
        buttons={navButtons}
      />

      <h2 className='text-2xl font-semibold mb-4'>Mapa de Reportes (Director IT)</h2>

      {loading ? (
        <p>Cargando mapa de reportes...</p>
      ) : reports.length === 0 ? (
        <p>No hay reportes con coordenadas para mostrar en el mapa.</p>
      ) : (
        <ReportsSummaryMap reports={reports} showIds={canViewIds(role)} />
      )}
    </div>
  )
}

export default SummaryMapPage

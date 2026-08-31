'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ButtonBack from '@/app/components/ButtonBack'
import PageHeaderCard from '@/app/components/PageHeaderCard'
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

  return (
    <div>
      <ButtonBack />

      <PageHeaderCard
        title='Mapa de Reportes'
        description='Visualización geográfica de todos los reportes registrados.'
      />

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

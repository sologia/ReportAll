'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'

const CrewReportsDetailPage = () => {
  const params = useParams()
  const crewId = params?.crewId

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const columns = [
    { header: 'Asignación ID', field: 'Assigment_ID' },
    { header: 'Reporte ID', field: 'Report_ID' },
    { header: 'Problema', field: 'Name_Problem' },
    { header: 'Urgencia', field: 'Urgency' },
    { header: 'Dirección', field: 'Adress' },
    { header: 'Distrito', field: 'District' },
    { header: 'Estado', field: 'State' },
    { header: 'Fecha', field: 'Assignment_Date' },
  ]

  useEffect(() => {
    if (!crewId) return

    const loadData = async () => {
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await fetch(`${base}/api/crews/${crewId}/reports`)
        const result = await response.json()
        setData(Array.isArray(result) ? result : [])
      } catch (error) {
        console.error('Error cargando detalle de reportes por cuadrilla', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [crewId])

  return (
    <div>
      <div className='mb-6'>
        <ButtonBack />
      </div>

      <h2 className='text-2xl font-semibold mb-4'>Detalle de reportes atendidos - Cuadrilla {crewId}</h2>

      <div>
        {loading ? <p>Cargando detalle...</p> : <SimpleTable columns={columns} data={data} />}
      </div>
    </div>
  )
}

export default CrewReportsDetailPage

'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import { getSession } from '@/lib/auth'
import { canViewIds, normalizeRole } from '@/lib/rbac'

const CrewReportsDetailPage = () => {
  const role = normalizeRole(getSession()?.role)
  const showIds = canViewIds(role)
  const params = useParams()
  const crewId = params?.crewId

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [problemFilter, setProblemFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

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

  const visibleColumns = showIds
    ? columns
    : columns.filter((column) => column.field !== 'Assigment_ID' && column.field !== 'Report_ID')

  const problemOptions = [...new Set(data.map((row) => row.Name_Problem).filter(Boolean))]
  const stateOptions = [...new Set(data.map((row) => row.State).filter(Boolean))]

  useEffect(() => {
    if (!crewId) return

    const loadData = async () => {
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_API_URL || ''
        const query = new URLSearchParams()
        if (problemFilter) query.set('problem', problemFilter)
        if (stateFilter) query.set('state', stateFilter)
        if (dateFilter) query.set('date', dateFilter)
        const queryString = query.toString()
        const endpoint = `${base}/api/crews/${crewId}/reports${queryString ? `?${queryString}` : ''}`

        const response = await fetch(endpoint)
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
  }, [crewId, problemFilter, stateFilter, dateFilter])

  return (
    <div>
      <div className='mb-6'>
        <ButtonBack />
      </div>

      <h2 className='text-2xl font-semibold mb-4'>Detalle de reportes atendidos {showIds ? `- Cuadrilla ${crewId}` : ''}</h2>

      <div className='mb-4 grid gap-3 md:grid-cols-3'>
        <div className='flex flex-col gap-1'>
          <label htmlFor='problemFilter' className='text-sm font-medium'>Problema</label>
          <select
            id='problemFilter'
            value={problemFilter}
            onChange={(e) => setProblemFilter(e.target.value)}
            className='rounded-md border px-3 py-2'
          >
            <option value=''>Todos</option>
            {problemOptions.map((problem) => (
              <option key={problem} value={problem}>{problem}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='stateFilter' className='text-sm font-medium'>Estado</label>
          <select
            id='stateFilter'
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className='rounded-md border px-3 py-2'
          >
            <option value=''>Todos</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='dateFilter' className='text-sm font-medium'>Fecha</label>
          <input
            id='dateFilter'
            type='date'
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className='rounded-md border px-3 py-2'
          />
        </div>
      </div>

      <div>
        {loading ? <p>Cargando detalle...</p> : <SimpleTable columns={visibleColumns} data={data} />}
      </div>
    </div>
  )
}

export default CrewReportsDetailPage

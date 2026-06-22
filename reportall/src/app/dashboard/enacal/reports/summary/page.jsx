'use client'

import React, { useEffect, useMemo, useState } from 'react'
import SimpleTable from '@/app/components/SimpleTable'
import ButtonBack from '@/app/components/ButtonBack'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import { getSession } from '@/lib/auth'
import { canViewIds, normalizeRole } from '@/lib/rbac'

const SummaryReportsPage = () => {
  const role = normalizeRole(getSession()?.role)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    state: '',
    district: '',
  })

  const columns = [
    { header: 'Problema', field: 'Name_Problem' },
    { header: 'Urgencia', field: 'Urgency' },
    { header: 'Dirección', field: 'Adress' },
    { header: 'Distrito', field: 'District' },
    { header: 'Estado', field: 'State' },
    { header: 'Fecha', field: 'Report_Date' },
  ]

  const visibleColumns = columns

  const stateOptions = useMemo(() => {
    const values = Array.from(new Set(data.map(item => item.State).filter(Boolean)))
    return values.sort((a, b) => a.localeCompare(b))
  }, [data])

  const districtOptions = useMemo(() => {
    const values = Array.from(new Set(data.map(item => item.District).filter(Boolean)))
    return values.sort((a, b) => a.localeCompare(b))
  }, [data])

  const loadSummary = async (activeFilters = filters) => {
    try {
      setLoading(true)
      const base = process.env.NEXT_PUBLIC_API_URL || ''
      const params = new URLSearchParams()

      if (activeFilters.dateFrom) params.append('dateFrom', activeFilters.dateFrom)
      if (activeFilters.dateTo) params.append('dateTo', activeFilters.dateTo)
      if (activeFilters.state) params.append('state', activeFilters.state)
      if (activeFilters.district) params.append('district', activeFilters.district)

      const query = params.toString()
      const response = await fetch(`${base}/api/reports/summary${query ? `?${query}` : ''}`)
      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Error cargando resumen de reportes', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleFilter = (event) => {
    event.preventDefault()
    loadSummary(filters)
  }

  const handleClear = () => {
    const reset = { dateFrom: '', dateTo: '', state: '', district: '' }
    setFilters(reset)
    loadSummary(reset)
  }

  return (
    <div>
      <ButtonBack />

      <PageHeaderCard
        title='Resumen General de Reportes'
        description='Análisis consolidado de todos los reportes en el sistema.'
      />

      <form onSubmit={handleFilter} className='flex flex-wrap gap-4 items-end'>
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
          <label htmlFor='state'>Estado</label>
          <select
            id='state'
            name='state'
            value={filters.state}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          >
            <option value=''>Todos</option>
            {stateOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
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
            {districtOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <button type='submit' className='bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition'>
          Filtrar
        </button>

        <button
          type='button'
          onClick={handleClear}
          className='bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition'
        >
          Limpiar
        </button>
      </form>

      <div className='mt-6'>
        {loading ? <p>Cargando resumen...</p> : <SimpleTable columns={visibleColumns} data={data} />}
      </div>
    </div>
  )
}

export default SummaryReportsPage

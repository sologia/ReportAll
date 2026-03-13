'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ButtonGroup from '@/app/components/ButtonGroup '

const CrewReportSummaryPage = () => {
  const [data, setData] = useState([])
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    order: 'desc',
    district: '',
    dateFrom: '',
    dateTo: '',
  })

  const loadSummary = async (activeFilters = filters) => {
    try {
      setLoading(true)
      const base = process.env.NEXT_PUBLIC_API_URL || ''
      const params = new URLSearchParams()

      if (activeFilters.order) params.append('order', activeFilters.order)
      if (activeFilters.district) params.append('district', activeFilters.district)
      if (activeFilters.dateFrom) params.append('dateFrom', activeFilters.dateFrom)
      if (activeFilters.dateTo) params.append('dateTo', activeFilters.dateTo)

      const query = params.toString()
      const response = await fetch(`${base}/api/crews/reports-summary${query ? `?${query}` : ''}`)
      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Error cargando resumen de cuadrillas', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || ''

    loadSummary()

    fetch(`${base}/api/sectors`)
      .then(res => res.json())
      .then(raw => setDistricts(Array.isArray(raw) ? raw : []))
      .catch(err => {
        console.error('Error cargando distritos', err)
        setDistricts([])
      })
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
    const reset = { order: 'desc', district: '', dateFrom: '', dateTo: '' }
    setFilters(reset)
    loadSummary(reset)
  }

  return (
    <div>
      <ButtonGroup
        buttons={[
          { label: 'Cuadrillas', href: '/dashboard/enacal/craw' },
          { label: 'Asignaciones', href: '/dashboard/enacal/assignments' },
          { label: 'Menu', href: '/dashboard/enacal' },
        ]}
      />

      <h2 className='text-2xl font-semibold mb-4'>Resumen de Reportes Atendidos por Cuadrilla</h2>

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
          <label htmlFor='order'>Orden por cantidad</label>
          <select
            id='order'
            name='order'
            value={filters.order}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          >
            <option value='desc'>Mayor a menor</option>
            <option value='asc'>Menor a mayor</option>
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
            {districts.map((district, index) => (
              <option key={index} value={district.Name_Sector}>{district.Name_Sector}</option>
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

      <div className='overflow-x-auto rounded-lg shadow-md mt-6 bg-white'>
        <table className='min-w-full border-collapse'>
          <thead className='bg-blue-600 text-white'>
            <tr>
              <th className='py-3 px-4 text-left text-sm font-medium'>Crew ID</th>
              <th className='py-3 px-4 text-left text-sm font-medium'>Número Cuadrilla</th>
              <th className='py-3 px-4 text-left text-sm font-medium'>Distrito</th>
              <th className='py-3 px-4 text-left text-sm font-medium'>Reportes Atendidos</th>
              <th className='py-3 px-4 text-left text-sm font-medium'>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className='text-center py-4 text-gray-500'>Cargando...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center py-4 text-gray-500'>No hay datos</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.Crew_ID} className='border-b hover:bg-blue-50 transition'>
                  <td className='py-3 px-4 text-sm text-gray-700'>{row.Crew_ID}</td>
                  <td className='py-3 px-4 text-sm text-gray-700'>{row.Num_Crew}</td>
                  <td className='py-3 px-4 text-sm text-gray-700'>{row.District}</td>
                  <td className='py-3 px-4 text-sm text-gray-700'>{row.Reports_Attended}</td>
                  <td className='py-3 px-4 text-sm text-gray-700'>
                    <Link
                      href={`/dashboard/enacal/craw/report-summary/${row.Crew_ID}`}
                      className='bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition'
                    >
                      Ver reportes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CrewReportSummaryPage

'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import SimpleTable from '@/app/components/SimpleTable'
import StateBadge from '@/app/components/StateBadge'
import { buildSessionHeaders, getSession } from '@/lib/auth'
import { canViewIds, normalizeRole } from '@/lib/rbac'

const columns = [
  { header: 'Asignación ID', field: 'Assigment_ID' },
  { header: 'Reporte ID', field: 'Report_ID' },
  { header: 'Problema', field: 'Name_Problem' },
  { header: 'Urgencia', field: 'Urgency' },
  { header: 'Dirección', field: 'Adress' },
  { header: 'Distrito', field: 'District' },
  { header: 'Estado actual', field: 'State' },
  { header: 'Fecha', field: 'Assignment_Date' },
]

export default function CrewAssignedReportsPage() {
  const role = normalizeRole(getSession()?.role)
  const showIds = canViewIds(role)
  const [session, setSession] = useState(null)
  const [reports, setReports] = useState([])
  const [states, setStates] = useState([])
  const [selectedStates, setSelectedStates] = useState({})
  const [loading, setLoading] = useState(false)

  const base = process.env.NEXT_PUBLIC_API_URL || ''

  const loadReports = async (activeSession) => {
    const current = activeSession || session
    if (!current?.crewId) {
      setReports([])
      return
    }

    try {
      setLoading(true)
      const headers = buildSessionHeaders(current)
      const response = await fetch(`${base}/api/crews/${current.crewId}/reports`, { headers, credentials: 'include' })
      const data = await response.json()
      const rows = Array.isArray(data) ? data : []
      setReports(rows)

      const nextSelected = {}
      rows.forEach((row) => {
        if (row.Assigment_ID) {
          nextSelected[row.Assigment_ID] = row.State || ''
        }
      })
      setSelectedStates(nextSelected)
    } catch (error) {
      console.error('Error cargando reportes asignados de cuadrilla', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const currentSession = getSession()
    setSession(currentSession)

    const headers = buildSessionHeaders(currentSession)
    fetch(`${base}/api/states`, { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch(() => setStates([]))

    loadReports(currentSession)
  }, [])

  const onChangeState = (assigmentId, value) => {
    setSelectedStates((previous) => ({ ...previous, [assigmentId]: value }))
  }

  const onSaveState = async (assigmentId) => {
    const nextState = selectedStates[assigmentId]
    if (!nextState) {
      await Swal.fire({
        icon: 'warning',
        title: 'Estado requerido',
        text: 'Selecciona un estado antes de guardar.',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...buildSessionHeaders(session),
      }

      const response = await fetch(`${base}/api/assignments/${assigmentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ StateAs: nextState }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body?.message || 'No se pudo actualizar el estado')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: 'El estado del reporte se guardó correctamente.',
        confirmButtonText: 'Aceptar',
      })

      loadReports()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error?.message || 'No se pudo actualizar el estado',
        confirmButtonText: 'Entendido',
      })
    }
  }

  if (!session?.crewId) {
    return <p className='ml-6 mt-6'>Tu usuario de cuadrilla no tiene Crew_ID asociado.</p>
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>Mis reportes asignados</h2>
      {loading ? <p>Cargando reportes...</p> : <SimpleTable columns={columns} data={reports} />}

      <div className='rounded-xl border bg-white p-4 shadow-sm overflow-x-auto'>
        <h3 className='font-semibold mb-3'>Actualizar estado por asignación</h3>
        <table className='min-w-full border-collapse'>
          <thead className='bg-blue-600 text-white'>
            <tr>
              {showIds ? <th className='py-3 px-4 text-left text-sm font-medium'>Asignación</th> : null}
              {showIds ? <th className='py-3 px-4 text-left text-sm font-medium'>Reporte</th> : null}
              <th className='py-3 px-4 text-left text-sm font-medium'>Estado</th>
              <th className='py-3 px-4 text-left text-sm font-medium'>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={showIds ? 4 : 2} className='text-center py-4 text-gray-500'>No tienes reportes asignados.</td>
              </tr>
            ) : (
              reports.map((row) => (
                <tr key={row.Assigment_ID} className='border-b hover:bg-blue-50 transition'>
                  {showIds ? <td className='py-3 px-4 text-sm text-gray-700'>{row.Assigment_ID}</td> : null}
                  {showIds ? <td className='py-3 px-4 text-sm text-gray-700'>#{row.Report_ID}</td> : null}
                  <td className='py-3 px-4 text-sm text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <select
                        className='rounded-md border px-2 py-1'
                        value={selectedStates[row.Assigment_ID] || ''}
                        onChange={(event) => onChangeState(row.Assigment_ID, event.target.value)}
                      >
                        <option value=''>Seleccione</option>
                        {states.map((stateOption, idx) => (
                          <option key={`${stateOption.StateAs}-${idx}`} value={stateOption.StateAs}>{stateOption.StateAs}</option>
                        ))}
                      </select>
                      <StateBadge value={selectedStates[row.Assigment_ID] || row.State} />
                    </div>
                  </td>
                  <td className='py-3 px-4 text-sm text-gray-700'>
                    <button
                      type='button'
                      className='bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition'
                      onClick={() => onSaveState(row.Assigment_ID)}
                    >
                      Guardar estado
                    </button>
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

'use client'

import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import ButtonBack from '@/app/components/ButtonBack'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import SectionCard from '@/app/components/SectionCard'
import { buildSessionHeaders } from '@/lib/auth'

const PLATE_PATTERN = /^[A-Z0-9-]{3,20}$/

function normalizePlate(value) {
  return String(value || '').trim().toUpperCase()
}

function isValidPlate(value) {
  return PLATE_PATTERN.test(value)
}

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([])
  const [plate, setPlate] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingPlate, setEditingPlate] = useState('')
  const base = process.env.NEXT_PUBLIC_API_URL || ''

  const loadVehicles = async () => {
    const response = await fetch(`${base}/api/vehicles`, { credentials: 'include' })
    const data = await response.json().catch(() => [])
    setVehicles(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    loadVehicles().catch((error) => console.error('Error cargando matrículas', error))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const normalizedPlate = normalizePlate(plate)

    if (!normalizedPlate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes escribir una matrícula válida.',
        confirmButtonText: 'Aceptar',
      })
      return
    }
    if (!isValidPlate(normalizedPlate)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula inválida',
        text: 'Usa solo letras, números o guion (3-20 caracteres).',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`${base}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildSessionHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ Plate: normalizedPlate }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.message || body.error || 'No se pudo registrar la matrícula')
      }

      setPlate('')
      await loadVehicles()
      await Swal.fire({
        icon: 'success',
        title: 'Matrícula registrada',
        text: `La matrícula ${body.Plate || normalizedPlate} se agregó correctamente.`,
        confirmButtonText: 'Aceptar',
      })
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.message || 'No se pudo registrar la matrícula',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (vehicle) => {
    setEditingId(vehicle.Vehicle_ID)
    setEditingPlate(vehicle.Plate)
  }

  const handleEditSubmit = async () => {
    const normalizedPlate = normalizePlate(editingPlate)

    if (!normalizedPlate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes escribir una matrícula válida.',
        confirmButtonText: 'Aceptar',
      })
      return
    }
    if (!isValidPlate(normalizedPlate)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula inválida',
        text: 'Usa solo letras, números o guion (3-20 caracteres).',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`${base}/api/vehicles/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...buildSessionHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ Plate: normalizedPlate }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.message || body.error || 'No se pudo actualizar la matrícula')
      }

      setEditingId(null)
      setEditingPlate('')
      await loadVehicles()
      await Swal.fire({
        icon: 'success',
        title: 'Matrícula actualizada',
        text: `La matrícula se actualizó correctamente.`,
        confirmButtonText: 'Aceptar',
      })
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error.message || 'No se pudo actualizar la matrícula',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingPlate('')
  }

  return (
    <section className='w-full px-2 sm:px-4 pb-6'>
      <ButtonBack />

      <PageHeaderCard
        title='Gestión de matrículas'
        description='Agrega y edita las matrículas disponibles para asignarlas a las cuadrillas.'
      />

      <SectionCard>
        <form onSubmit={handleSubmit} className='flex flex-col lg:flex-row lg:items-end gap-4'>
          <div className='flex-1'>
            <label htmlFor='plate' className='block text-sm font-medium text-slate-700 mb-2'>Matrícula</label>
            <input
              id='plate'
              name='plate'
              value={plate}
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              className='w-full rounded-2xl bg-[#b2b1b1] px-3 py-2'
              placeholder='Ejemplo: MZ1234'
              maxLength={20}
            />
          </div>

          <button
            type='submit'
            disabled={saving}
            className='w-full lg:w-56 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-70'
          >
            {saving ? 'Guardando...' : 'Agregar matrícula'}
          </button>
        </form>
      </SectionCard>

      <div className='overflow-x-auto rounded-2xl border border-slate-200 shadow-[0_8px_20px_rgba(15,23,42,0.06)] mt-6 bg-white'>
        <table className='min-w-full border-collapse text-sm'>
          <thead className='bg-slate-800 text-white'>
            <tr>
              <th className='py-3 px-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap'>Matrícula</th>
              <th className='py-3 px-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap'>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={2} className='text-center py-8 text-slate-500'>
                  No hay matrículas registradas
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.Vehicle_ID} className='border-b border-slate-100 hover:bg-sky-50/70 transition'>
                  <td className='py-3 px-4'>
                    {editingId === vehicle.Vehicle_ID ? (
                      <input
                        type='text'
                        value={editingPlate}
                        onChange={(e) => setEditingPlate(e.target.value.toUpperCase())}
                        className='w-full rounded-lg bg-[#b2b1b1] px-2 py-1'
                        maxLength={20}
                      />
                    ) : (
                      <span className='font-medium text-slate-900'>{vehicle.Plate}</span>
                    )}
                  </td>
                  <td className='py-3 px-4'>
                    {editingId === vehicle.Vehicle_ID ? (
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={handleEditSubmit}
                          disabled={saving}
                          className='px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-70 text-xs'
                        >
                          Guardar
                        </button>
                        <button
                          type='button'
                          onClick={cancelEdit}
                          disabled={saving}
                          className='px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-70 text-xs'
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={() => startEdit(vehicle)}
                          className='px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs'
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default VehiclesPage
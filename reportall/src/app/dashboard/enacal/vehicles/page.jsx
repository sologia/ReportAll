'use client'

import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import ButtonBack from '@/app/components/ButtonBack'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import SectionCard from '@/app/components/SectionCard'
import SimpleTable from '@/app/components/SimpleTable'
import { buildSessionHeaders } from '@/lib/auth'

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([])
  const [plate, setPlate] = useState('')
  const [saving, setSaving] = useState(false)
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
    const normalizedPlate = String(plate || '').trim().toUpperCase()

    if (!normalizedPlate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes escribir una matrícula válida.',
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

  return (
    <section className='w-full px-2 sm:px-4 pb-6'>
      <ButtonBack />

      <PageHeaderCard
        title='Gestión de matrículas'
        description='Agrega y consulta las matrículas disponibles para asignarlas a las cuadrillas.'
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

      <SimpleTable
        columns={[
          { header: 'Matrícula', field: 'Plate' },
        ]}
        data={vehicles}
      />
    </section>
  )
}

export default VehiclesPage
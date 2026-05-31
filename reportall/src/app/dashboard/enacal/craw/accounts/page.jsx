'use client'

import React, { useEffect, useState } from 'react'
import ButtonBack from '@/app/components/ButtonBack'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import SectionCard from '@/app/components/SectionCard'
import { buildSessionHeaders } from '@/lib/auth'

const CrewAccountsPage = () => {
  const [accounts, setAccounts] = useState([])
  const [passwordsByUserId, setPasswordsByUserId] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyUserId, setBusyUserId] = useState(null)
  const base = process.env.NEXT_PUBLIC_API_URL || ''

  const loadAccounts = async () => {
    const response = await fetch(`${base}/api/auth/crew-accounts`, {
      headers: buildSessionHeaders(),
      credentials: 'include',
    })
    const data = await response.json().catch(() => [])
    if (!response.ok) {
      throw new Error(data.message || data.error || 'No se pudieron cargar las cuentas')
    }

    setAccounts(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    loadAccounts()
      .catch((error) => console.error('Error cargando cuentas de cuadrillas', error))
      .finally(() => setLoading(false))
  }, [])

  const handleResetPassword = async (userId) => {
    try {
      setBusyUserId(userId)
      const response = await fetch(`${base}/api/auth/crew-accounts/${userId}/reset-password`, {
        method: 'POST',
        headers: buildSessionHeaders(),
        credentials: 'include',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || data.error || 'No se pudo regenerar la contraseña')
      }

      setPasswordsByUserId((current) => ({
        ...current,
        [userId]: data.password,
      }))
    } catch (error) {
      console.error('Error regenerando contraseña', error)
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <section className='w-full px-2 sm:px-4 pb-6'>
      <ButtonBack />

      <PageHeaderCard
        title='Accesos de cuadrillas'
        description='Consulta los correos de acceso de las cuadrillas y genera una contraseña temporal visible cuando sea necesario.'
      />

      <SectionCard className='mb-6'>
        <p className='text-sm text-slate-600'>
          Las contraseñas actuales no se pueden leer porque el sistema guarda hashes. Cuando necesites una visible, usa regenerar contraseña para emitir una temporal nueva.
        </p>
      </SectionCard>

      <SectionCard>
        <div className='overflow-x-auto'>
          <table className='min-w-full border-collapse'>
            <thead className='bg-blue-600 text-white'>
              <tr>
                <th className='py-3 px-4 text-left text-sm font-medium'>N° Cuadrilla</th>
                <th className='py-3 px-4 text-left text-sm font-medium'>Nombre</th>
                <th className='py-3 px-4 text-left text-sm font-medium'>Correo</th>
                <th className='py-3 px-4 text-left text-sm font-medium'>Estado</th>
                <th className='py-3 px-4 text-left text-sm font-medium'>Contraseña temporal</th>
                <th className='py-3 px-4 text-left text-sm font-medium'>Acción</th>
              </tr>
            </thead>
            <tbody>
              {!loading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center py-4 text-gray-500'>No hay cuentas de cuadrillas</td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.User_ID} className='border-b hover:bg-blue-50 transition'>
                    <td className='py-3 px-4 text-sm text-gray-700'>{account.Num_Crew || 'Sin número'}</td>
                    <td className='py-3 px-4 text-sm text-gray-700'>{account.Display_Name || 'Sin nombre'}</td>
                    <td className='py-3 px-4 text-sm text-gray-700'>{account.Email}</td>
                    <td className='py-3 px-4 text-sm text-gray-700'>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${account.Is_Active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {account.Is_Active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-700'>
                      {passwordsByUserId[account.User_ID] || 'No visible'}
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-700'>
                      <button
                        type='button'
                        onClick={() => handleResetPassword(account.User_ID)}
                        disabled={busyUserId === account.User_ID}
                        className='bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70'
                      >
                        {busyUserId === account.User_ID ? 'Generando...' : 'Regenerar contraseña'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  )
}

export default CrewAccountsPage
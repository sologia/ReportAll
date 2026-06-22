'use client'

import { useEffect, useRef, useState } from 'react'
import ButtonBack from '@/app/components/ButtonBack'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import SimpleTable from '@/app/components/SimpleTable'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { buildSessionHeaders, getSession } from '@/lib/auth'

const columns = [
  { header: 'Problema', field: 'Problem' },
  { header: 'Dirección', field: 'Adress' },
  { header: 'Distrito', field: 'District' },
  { header: 'Estado', field: 'State' },
  { header: 'Fecha', field: 'Report_Date' },
]

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || ''
}

function normalizeRows(rows = []) {
  return rows.map((row) => ({
    ...row,
    Problem: row?.Problem || row?.Name_Problem || 'Sin problema',
    Report_Date: row?.Report_Date
      ? String(row.Report_Date).slice(0, 10)
      : row?.Date_Time
        ? String(row.Date_Time).slice(0, 10)
        : 'Sin fecha',
  }))
}

const ViewReportClient = () => {
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    const session = getSession()
    if (!session) {
      router.replace('/auth/login')
      return
    }

    if (!session.clientId) {
      Swal.fire({
        icon: 'warning',
        title: 'Perfil incompleto',
        text: 'No se encontró el identificador de cliente para cargar tus reportes.',
        confirmButtonText: 'Aceptar',
      })
      setLoading(false)
      return
    }

    const loadReports = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/reports/client/${session.clientId}`, {
          headers: buildSessionHeaders(session),
          credentials: 'include',
        })
        const data = await response.json().catch(() => [])
        setReports(normalizeRows(Array.isArray(data) ? data : []))
      } catch {
        await Swal.fire({
          icon: 'error',
          title: 'Error cargando reportes',
          text: 'No se pudieron cargar tus reportes.',
          confirmButtonText: 'Aceptar',
        })
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [router])

  return (
    <div className='rounded-2xl'>
      <ButtonBack />

      <PageHeaderCard
        title='Mis Reportes'
        description='Visualiza el estado de tus reportes registrados en el sistema.'
      />

      <div className='rounded-2xl w-full p-3 md:p-6'>
        {loading ? <p>Cargando reportes...</p> : <SimpleTable columns={columns} data={reports} />}
      </div>

    </div>
  )
}

export default ViewReportClient
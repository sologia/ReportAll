'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import ButtonBack from '@/app/components/ButtonBack'
import MultiFileUpload from '@/app/components/MultiFileUpload'
import SimpleTable from '@/app/components/SimpleTable'
import { useForm } from '@/hooks/useForm'
import Swal from 'sweetalert2'
import { buildSessionHeaders, getSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const MyMap = dynamic(() => import('@/app/components/MyMap'), { ssr: false })


const ReportFields = {
  tipoReporte: '',
  sector: '',
  direccion: '',
}

const reportColumns = [
  { header: 'Problema', field: 'Problem' },
  { header: 'Dirección', field: 'Adress' },
  { header: 'Distrito', field: 'District' },
  { header: 'Estado', field: 'State' },
  { header: 'Fecha', field: 'Report_Date' },
]

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || ''
}

function buildCurrentReportDateTime() {
  return new Date().toISOString()
}

function normalizeReportRows(rows = []) {
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

const CreateReportClient = () => {
  const router = useRouter()
  const [problems, setProblems] = useState([])
  const [sectors, setSectors] = useState([])
  const [reports, setReports] = useState([])
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [geoDenied, setGeoDenied] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)
  const loadedRef = useRef(false)
  const session = getSession()

  const {
    tipoReporte,
    sector,
    direccion,
    onInputChange: onReportInputChange,
    onResetForm,
  } = useForm(ReportFields)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

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

    const base = getApiBase()

    const loadPageData = async () => {
      try {
        const [problemsResponse, sectorsResponse, reportsResponse] = await Promise.all([
          fetch(`${base}/api/problems`, { headers: buildSessionHeaders(session), credentials: 'include' }),
          fetch(`${base}/api/sectors`, { headers: buildSessionHeaders(session), credentials: 'include' }),
          fetch(`${base}/api/reports/client/${session.clientId}`, { headers: buildSessionHeaders(session), credentials: 'include' }),
        ])

        const [problemsData, sectorsData, reportsData] = await Promise.all([
          problemsResponse.json().catch(() => []),
          sectorsResponse.json().catch(() => []),
          reportsResponse.json().catch(() => []),
        ])

        setProblems(Array.isArray(problemsData) ? problemsData : [])
        setSectors(Array.isArray(sectorsData) ? sectorsData : [])
        setReports(normalizeReportRows(Array.isArray(reportsData) ? reportsData : []))
      } catch {
        await Swal.fire({
          icon: 'error',
          title: 'Error cargando datos',
          text: 'No se pudieron cargar los datos del formulario.',
          confirmButtonText: 'Aceptar',
        })
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [router, session])

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude]
        setCurrentLocation(coords)
        setSelectedPosition(coords)
      },
      () => {
        setGeoDenied(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    )
  }, [])


  const ReportSubmit = async (e) => {
    e.preventDefault()

    if (!tipoReporte) {
      await Swal.fire({
        icon: 'warning',
        title: 'Problema requerido',
        text: 'Debes seleccionar un tipo de problema.',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    if (!sector) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sector requerido',
        text: 'Debes seleccionar un sector.',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    if (!direccion.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Dirección requerida',
        text: 'Debes ingresar una dirección de referencia.',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    if (!selectedPosition) {
      await Swal.fire({
        icon: 'warning',
        title: 'Ubicación requerida',
        text: 'Selecciona la ubicación del problema en el mapa.',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    if (!session?.clientId) {
      await Swal.fire({
        icon: 'error',
        title: 'Perfil incompleto',
        text: 'No se encontró el identificador de cliente para crear el reporte.',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    try {
      setSending(true)
      const body = new FormData()
      body.append('Name_Problem', tipoReporte)
      body.append('Urgency', 'Media')
      body.append('X', String(selectedPosition[1]))
      body.append('Y', String(selectedPosition[0]))
      body.append('Adress', direccion.trim())
      body.append('Name_Sector', sector)
      body.append('Date_Time', buildCurrentReportDateTime())
      body.append('ClientID', String(session.clientId))

      if (files[0]?.file) {
        body.append('BINPhoto', files[0].file)
      }

      const response = await fetch(`${getApiBase()}/api/reports`, {
        method: 'POST',
        headers: buildSessionHeaders(session),
        credentials: 'include',
        body,
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.message || 'No se pudo crear el reporte')
      }

      const reportsResponse = await fetch(`${getApiBase()}/api/reports/client/${session.clientId}`, {
        headers: buildSessionHeaders(session),
        credentials: 'include',
      })
      const reportsData = await reportsResponse.json().catch(() => [])
      setReports(normalizeReportRows(Array.isArray(reportsData) ? reportsData : []))
      onResetForm()
      setFiles([])
      setUploadKey((value) => value + 1)
      setSelectedPosition(null)

      await Swal.fire({
        icon: 'success',
        title: 'Reporte creado',
        text: 'Tu reporte fue creado correctamente.',
        confirmButtonText: 'Aceptar',
      })
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo crear el reporte',
        text: error?.message || 'Ocurrió un error al crear el reporte.',
        confirmButtonText: 'Aceptar',
      })
    } finally {
      setSending(false)
    }
  }


  return (
    <div className='rounded-2xl space-y-5'>
      
      <div>
        <ButtonBack/>
      </div>

      <form onSubmit={ReportSubmit} className="flex flex-col gap-6" noValidate>

        <section className='rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
          <div className='text-center mb-6'>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-900'>Crear reporte</h1>
            <p className='mt-2 text-slate-600'>Completa los datos y marca la ubicacion para registrar la incidencia.</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[220px_1fr] items-center gap-3 mb-4'>
            <label className='field-label'>Selecciona un problema</label>
            <select 
              name="tipoReporte" 
              value={ tipoReporte } 
              onChange={ onReportInputChange }
              className='field-control'
            >
              <option value="">Seleccione</option>
              {problems.map((problem, index) => (
                <option key={`${problem.Name_Problem}-${index}`} value={problem.Name_Problem}>
                  {problem.Name_Problem}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[220px_1fr] items-center gap-3 mb-4'>
            <label className='field-label'>Sector</label>
            <select
              name='sector'
              value={sector}
              onChange={onReportInputChange}
              className='field-control'
            >
              <option value="">Seleccione</option>
              {sectors.map((item, index) => (
                <option key={`${item.Name_Sector}-${index}`} value={item.Name_Sector}>
                  {item.Name_Sector}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[220px_1fr] items-start gap-3 mb-4'>
            <label className='field-label pt-2'>Direccion</label>
            <textarea
              name='direccion'
              value={direccion}
              onChange={onReportInputChange}
              className='field-control min-h-24 resize-y'
              placeholder='Escribe una referencia clara de direccion'
            />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[220px_1fr] items-start gap-3'>
            <label className='field-label pt-2'>Adjuntos</label>
            <div className='w-full'>
              <MultiFileUpload key={uploadKey} onFilesSelect={setFiles} />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
          <p className='text-lg sm:text-xl font-semibold text-slate-900'>Selecciona la ubicacion del problema</p>
          {geoDenied && (
            <p className='mt-1 text-sm text-amber-700'>No se pudo obtener tu ubicacion actual. Selecciona manualmente el punto en el mapa.</p>
          )}
          <div className='mt-3 rounded-xl overflow-hidden border border-slate-200'>
            <MyMap onSelect={setSelectedPosition} selectedPosition={selectedPosition} currentLocation={currentLocation} />
          </div>
        </section>

        <div className='flex mb-2'>
          <button
                type="submit"
                disabled={sending || loading}
                className="btn-primary w-full sm:w-auto px-8 disabled:opacity-60"
            >
                {sending ? 'Enviando reporte...' : 'Enviar reporte'}
          </button>
        </div>
      </form>

      <section className='rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
        <h2 className='text-2xl font-semibold'>Reportes ya creados</h2>
        {loading ? <p className='mt-4'>Cargando reportes...</p> : <SimpleTable columns={reportColumns} data={reports} />}
      </section>
      

    </div>
  )
}

export default CreateReportClient
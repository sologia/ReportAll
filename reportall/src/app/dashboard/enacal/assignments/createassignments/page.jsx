'use client'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import SectionCard from '@/app/components/SectionCard'
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { buildSessionHeaders, getSession } from '@/lib/auth'
import { canViewIds, normalizeRole } from '@/lib/rbac'

const CreateAssignments = () => {
    const session = getSession()
    const role = normalizeRole(session?.role)
    const showIds = canViewIds(role)
    const [numcrew, setNumCrew] = useState([])
    const [reports, setReports] = useState([])
    const [assignments, setAssignments] = useState([])
    const [crewInfo, setCrewInfo] = useState([])
    const [stateAs, setStateAs] = useState([])
    const [leader, setLeader] = useState([])
    const [selectedCrew, setSelectedCrew] = useState('')
    const [submitError, setSubmitError] = useState('')

    const base = process.env.NEXT_PUBLIC_API_URL || ''

    const unassignedReports = reports.filter((report) => {
        const isAssigned = assignments.some((assignment) => Number(assignment.Report_ID) === Number(report.Report_ID))
        return !isAssigned
    })

    const selectedCrewInfo = numcrew.find((crew) => String(crew.Num_Crew) === String(selectedCrew))
    const selectedCrewDistrict = selectedCrewInfo?.District || ''

    const allowedReports = selectedCrewDistrict
        ? unassignedReports.filter((report) => report.District === selectedCrewDistrict)
        : unassignedReports

    const unassignedReportsColumns = [
        { header: 'Direccion', field: 'Adress' },
        { header: 'Problema', field: 'Name_Problem' },
        { header: 'Urgencia', field: 'Urgency' },
        { header: 'Distrito', field: 'District' },
    ]

    const crewInfoColumns = [
        { header: 'Representante', field: 'Representative_Name' },
        { header: 'Numero Cuadrilla', field: 'Num_Crew' },
        { header: 'Disponibilidad', field: 'Availability_Crew' },
        { header: 'Sector', field: 'Name_Sector' },
        { header: 'Placa', field: 'Plate' },
    ]

    const loadData = async () => {
        try {
            const requests = [
                fetch(`${base}/api/crewsonly`),
                fetch(`${base}/api/states`),
                fetch(`${base}/api/reports/options`),
                fetch(`${base}/api/assignments`),
                fetch(`${base}/api/crews`),
            ]

            const responses = role === 'lider_cuadrilla'
                ? await Promise.all(requests)
                : await Promise.all([fetch(`${base}/api/leaders`), ...requests])

            let leaders = []
            let crewsOnlyRes
            let statesRes
            let reportsRes
            let assignmentsRes
            let crewsRes

            if (role === 'lider_cuadrilla') {
                [crewsOnlyRes, statesRes, reportsRes, assignmentsRes, crewsRes] = responses
            } else {
                const leadersRes = responses[0]
                ;[crewsOnlyRes, statesRes, reportsRes, assignmentsRes, crewsRes] = responses.slice(1)
                leaders = await leadersRes.json()
            }

            const [crewsOnly, states, reportsData, assignmentsData, crewsData] = await Promise.all([
                crewsOnlyRes.json(),
                statesRes.json(),
                reportsRes.json(),
                assignmentsRes.json(),
                crewsRes.json(),
            ])

            const normalizedCrewsOnly = Array.isArray(crewsOnly) ? crewsOnly : []
            const representativeByCrew = normalizedCrewsOnly.reduce((accumulator, crew) => {
                accumulator[String(crew.Num_Crew)] = crew.Representative_Name || crew.Crew_Label || ''
                return accumulator
            }, {})

            setLeader(Array.isArray(leaders) ? leaders : [])
            setNumCrew(normalizedCrewsOnly)
            setStateAs(Array.isArray(states) ? states : [])
            setReports(Array.isArray(reportsData) ? reportsData : [])
            setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
            setCrewInfo(
                Array.isArray(crewsData)
                    ? crewsData.map((crew) => ({
                        ...crew,
                        Representative_Name: representativeByCrew[String(crew.Num_Crew)] || 'Sin representante',
                    }))
                    : [],
            )
        } catch (err) {
            console.error('Error cargando datos de asignaciones', err)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')
        const form = e.target
        const selectedDate = form.date.value
        const selectedState = form.opciones_estados.value
        const selectedReportId = parseInt(form.opciones_reporte.value, 10)
        const selectedCrewNumber = parseInt(form.opciones_cuadrillas.value, 10)

        if (!selectedDate) {
            await Swal.fire({
                icon: 'warning',
                title: 'Fecha requerida',
                text: 'Debes seleccionar la fecha de la asignación.',
                confirmButtonText: 'Aceptar',
            })
            return
        }

        if (role !== 'lider_cuadrilla' && !form.opciones_lider.value) {
            await Swal.fire({
                icon: 'warning',
                title: 'Líder requerido',
                text: 'Debes seleccionar un líder para la asignación.',
                confirmButtonText: 'Aceptar',
            })
            return
        }

        if (!Number.isInteger(selectedCrewNumber) || selectedCrewNumber <= 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Cuadrilla requerida',
                text: 'Debes seleccionar una cuadrilla válida.',
                confirmButtonText: 'Aceptar',
            })
            return
        }

        if (!Number.isInteger(selectedReportId) || selectedReportId <= 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Reporte requerido',
                text: 'Debes seleccionar un reporte válido.',
                confirmButtonText: 'Aceptar',
            })
            return
        }

        if (!selectedState) {
            await Swal.fire({
                icon: 'warning',
                title: 'Estado requerido',
                text: 'Debes seleccionar el estado de la asignación.',
                confirmButtonText: 'Aceptar',
            })
            return
        }

        const payload = {
            Num_Crew: selectedCrewNumber,
            Report_ID: selectedReportId,
            Date_Time: selectedDate,
            StateAs: selectedState,
        }

        if (role !== 'lider_cuadrilla') {
            payload.Name_Leader = form.opciones_lider.value
        }

        try {
            const response = await fetch(`${base}/api/assignments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...buildSessionHeaders(getSession()),
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'No se pudo crear la asignación')
            }

            form.reset()
            setSelectedCrew('')
            await loadData()
            await Swal.fire({
                icon: 'success',
                title: 'Asignación creada',
                text: 'La asignación se registró correctamente.',
                confirmButtonText: 'Aceptar',
            })
        } catch (err) {
            console.error('Error creating assignment', err)
            const errorMessage = err.message || 'No se pudo crear la asignación'
            setSubmitError(errorMessage)
            await Swal.fire({
                icon: 'error',
                title: 'Error al crear',
                text: errorMessage,
                confirmButtonText: 'Entendido',
            })
        }
    }

    return (
        <section className='w-full px-2 sm:px-4 pb-6'>
            <div>
                <ButtonBack />
            </div>

            <PageHeaderCard
                title='Crear Asignación'
                description='Asigna reportes a cuadrillas según disponibilidad y distrito.'
            />

            <SectionCard>
                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row xl:justify-between items-start gap-6" noValidate>
                    <div className='flex flex-col gap-4 w-full'>
                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
                        <label htmlFor="date" className='w-full sm:w-36'>Fecha dd/mm/aa </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            className="bg-[#b2b1b1] rounded-2xl w-full sm:w-64 px-3 py-2"
                            required
                        />
                        </div>

                        {role === 'lider_cuadrilla' ? (
                            <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
                            <label className='w-full sm:w-36'>Líder</label>
                            <p className='bg-[#d9edf7] rounded-2xl w-full sm:w-80 px-3 py-2'>{session?.displayName || 'Líder autenticado'}</p>
                            </div>
                        ) : (
                            <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
                            <label htmlFor="opciones_lider" className='w-full sm:w-36'>Nombre Lider</label>
                            <select
                                name="opciones_lider"
                                id="opciones_lider"
                                className='bg-[#b2b1b1] rounded-2xl w-full sm:w-64 px-3 py-2'
                                required
                            >
                                <option value="">Seleccione</option>
                                {leader.map((t, idx) => (
                                    <option key={idx} value={t.Name_Leader}>{t.Name_Leader}</option>
                                ))}
                            </select>
                            </div>
                        )}

                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
                        <label htmlFor="opciones_cuadrillas" className='w-full sm:w-36'>Cuadrilla</label>
                        <select
                            name="opciones_cuadrillas"
                            id="opciones_cuadrillas"
                            className='bg-[#b2b1b1] rounded-2xl w-full sm:w-80 px-3 py-2'
                            value={selectedCrew}
                            onChange={(e) => {
                                setSelectedCrew(e.target.value)
                            }}
                            required
                        >
                            <option value="">Seleccione</option>
                            {numcrew.map((c, idx) => (
                                <option key={idx} value={c.Num_Crew}>
                                    {`${c.Crew_Label || c.Representative_Name || `Cuadrilla ${c.Num_Crew}`} | N. ${c.Num_Crew} | ${c.District || 'Sin distrito'}`}
                                </option>
                            ))}
                        </select>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
                        <label htmlFor='opciones_reporte' className='w-full sm:w-36'>Reporte</label>
                        <select
                            name="opciones_reporte"
                            id="opciones_reporte"
                            className='bg-[#b2b1b1] rounded-2xl w-full sm:w-80 px-3 py-2'
                            required
                        >
                            <option value="">Seleccione</option>
                            {allowedReports.map((report) => (
                                <option key={report.Report_ID} value={report.Report_ID}>
                                    {showIds
                                        ? `#${report.Report_ID} - ${report.Adress || 'Sin dirección'} (${report.District || 'Sin distrito'})`
                                        : `${report.Adress || 'Sin dirección'} (${report.District || 'Sin distrito'})`}
                                </option>
                            ))}
                        </select>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
                        <label htmlFor='opciones_estados' className='w-full sm:w-36'>Estado</label>
                        <select
                            name="opciones_estados"
                            id="opciones_estados"
                            className='bg-[#b2b1b1] rounded-2xl w-full sm:w-64 px-3 py-2'
                            required
                        >
                            <option value="">Seleccione</option>
                            {stateAs.map((s, idx) => (
                                <option key={idx} value={s.StateAs}>{s.StateAs}</option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3 w-full xl:w-auto'>
                        <button type="submit" className="w-full xl:w-56 mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                            Aceptar
                        </button>

                        <button type="button" className="w-full xl:w-56 mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </SectionCard>

            {submitError ? <p className='mt-3 text-red-600'>{submitError}</p> : null}

            <div className='mt-10'>
                <h3 className='text-xl font-semibold'>Reportes no asignados</h3>
                <SimpleTable columns={unassignedReportsColumns} data={allowedReports} />
            </div>

            <div className='mt-10'>
                <h3 className='text-xl font-semibold'>Informacion de las cuadrillas</h3>
                <SimpleTable columns={crewInfoColumns} data={crewInfo} />
            </div>
        </section>
    )
}
export default CreateAssignments

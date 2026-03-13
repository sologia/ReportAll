'use client'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useEffect, useState } from 'react'

const CreateAssignments = () => {
    const [numcrew, setNumCrew] = useState([])
    const [reports, setReports] = useState([])
    const [assignments, setAssignments] = useState([])
    const [crewInfo, setCrewInfo] = useState([])
    const [stateAs, setStateAs] = useState([])
    const [leader, setLeader] = useState([])

    const base = process.env.NEXT_PUBLIC_API_URL || ''

    const unassignedReports = reports.filter((report) => {
        const isAssigned = assignments.some((assignment) => Number(assignment.Report_ID) === Number(report.Report_ID))
        return !isAssigned
    })

    const unassignedReportsColumns = [
        { header: 'Reporte ID', field: 'Report_ID' },
        { header: 'Direccion', field: 'Adress' },
        { header: 'Problema', field: 'Name_Problem' },
        { header: 'Urgencia', field: 'Urgency' },
    ]

    const crewInfoColumns = [
        { header: 'Crew ID', field: 'Crew_ID' },
        { header: 'Numero Cuadrilla', field: 'Num_Crew' },
        { header: 'Disponibilidad', field: 'Availability_Crew' },
        { header: 'Sector', field: 'Name_Sector' },
        { header: 'Placa', field: 'Plate' },
    ]

    const loadData = async () => {
        try {
            const [leadersRes, crewsOnlyRes, statesRes, reportsRes, assignmentsRes, crewsRes] = await Promise.all([
                fetch(`${base}/api/leaders`),
                fetch(`${base}/api/crewsonly`),
                fetch(`${base}/api/states`),
                fetch(`${base}/api/reports/options`),
                fetch(`${base}/api/assignments`),
                fetch(`${base}/api/crews`),
            ])

            const [leaders, crewsOnly, states, reportsData, assignmentsData, crewsData] = await Promise.all([
                leadersRes.json(),
                crewsOnlyRes.json(),
                statesRes.json(),
                reportsRes.json(),
                assignmentsRes.json(),
                crewsRes.json(),
            ])

            setLeader(Array.isArray(leaders) ? leaders : [])
            setNumCrew(Array.isArray(crewsOnly) ? crewsOnly : [])
            setStateAs(Array.isArray(states) ? states : [])
            setReports(Array.isArray(reportsData) ? reportsData : [])
            setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
            setCrewInfo(Array.isArray(crewsData) ? crewsData : [])
        } catch (err) {
            console.error('Error cargando datos de asignaciones', err)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const form = e.target
        const payload = {
            Name_Leader: form.opciones_lider.value,
            Num_Crew: parseInt(form.opciones_cuadrillas.value, 10),
            Report_ID: parseInt(form.opciones_reporte.value, 10),
            Date_Time: form.date.value,
            StateAs: form.opciones_estados.value,
        }

        try {
            const response = await fetch(`${base}/api/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                throw new Error('No se pudo crear la asignación')
            }

            form.reset()
            await loadData()
        } catch (err) {
            console.error('Error creating assignment', err)
        }
    }

    return (
        <div>
            <div>
                <ButtonBack />
            </div>

            <form onSubmit={handleSubmit} className="flex justify-between items-start gap-9">
                <div className='flex flex-col gap-4 ml-16'>
                    <div className='flex gap-6 items-center'>
                        <label htmlFor="date" className='w-[90px]'>Fecha dd/mm/aa </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            className="bg-[#b2b1b1] rounded-2xl w-32"
                            required
                        />
                    </div>

                    <div className='flex gap-6 items-center'>
                        <label form="opciones_lider" className='w-24'>Nombre Lider</label>
                        <select
                            name="opciones_lider"
                            id="opciones_lider"
                            className='bg-[#b2b1b1] rounded-2xl w-32'
                            required
                        >
                            <option value="">Seleccione</option>
                            {leader.map((t, idx) => (
                                <option key={idx} value={t.Name_Leader}>{t.Name_Leader}</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex gap-6 items-center'>
                        <label form="opciones_cuadrillas" className='w-24'>Cuadrilla</label>
                        <select
                            name="opciones_cuadrillas"
                            id="opciones_cuadrillas"
                            className='bg-[#b2b1b1] rounded-2xl w-32'
                            required
                        >
                            <option value="">Seleccione</option>
                            {numcrew.map((c, idx) => (
                                <option key={idx} value={c.Num_Crew}>{c.Num_Crew}</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex gap-6 items-center'>
                        <label form='opciones_reporte' className='w-24'>Reporte</label>
                        <select
                            name="opciones_reporte"
                            id="opciones_reporte"
                            className='bg-[#b2b1b1] rounded-2xl w-32'
                            required
                        >
                            <option value="">Seleccione</option>
                            {reports.map((report) => (
                                <option key={report.Report_ID} value={report.Report_ID}>
                                    {`#${report.Report_ID} - ${report.Adress || 'Sin dirección'}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='flex gap-6 items-center'>
                        <label form='opciones_estados' className='w-24'>Estado</label>
                        <select
                            name="opciones_estados"
                            id="opciones_estados"
                            className='bg-[#b2b1b1] rounded-2xl w-32'
                            required
                        >
                            <option value="">Seleccione</option>
                            {stateAs.map((s, idx) => (
                                <option key={idx} value={s.StateAs}>{s.StateAs}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='flex flex-col gap-3 mr-16'>
                    <button type="submit" className="w-70 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                        Aceptar
                    </button>

                    <button type="button" className="w-70 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                        Cancelar
                    </button>
                </div>
            </form>

            <div className='mt-10'>
                <h3 className='text-xl font-semibold'>Reportes no asignados</h3>
                <SimpleTable columns={unassignedReportsColumns} data={unassignedReports} />
            </div>

            <div className='mt-10'>
                <h3 className='text-xl font-semibold'>Informacion de las cuadrillas</h3>
                <SimpleTable columns={crewInfoColumns} data={crewInfo} />
            </div>
        </div>
    )
}
export default CreateAssignments

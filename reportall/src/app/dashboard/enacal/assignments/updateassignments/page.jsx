"use client";
import React, { useState, useEffect } from 'react';
import ButtonBack from '@/app/components/ButtonBack';
import PageHeaderCard from '@/app/components/PageHeaderCard';
import SectionCard from '@/app/components/SectionCard';
import Swal from 'sweetalert2';
import { buildSessionHeaders, getSession } from '@/lib/auth';
import { canViewIds, normalizeRole } from '@/lib/rbac';

const UpdateAssignments = () => {
  const role = normalizeRole(getSession()?.role);
  const showIds = canViewIds(role);
  const [assignments, setAssignments] = useState([]);
  const [nameleader, setNameLeader] = useState([]);
  const [numcrew, setNumCrew] = useState([]);
  const [reports, setReports] = useState([]);
  const [stateas, setStateAs] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formValues, setFormValues] = useState({
    Name_Leader: '',
    Num_Crew: '',
    Report_ID: '',
    StateAs: '',
    Fecha: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const base = process.env.NEXT_PUBLIC_API_URL || '';

  const loadAssignments = () => {
    fetch(`${base}/api/assignments`)
      .then(res => res.json())
      .then(data => setAssignments(Array.isArray(data) ? data : []))
      .catch(err => console.error('failed loading assignments', err));
  };

  useEffect(() => {
    loadAssignments();

    Promise.all([
      fetch(`${base}/api/leaders`),
      fetch(`${base}/api/crewsonly`),
      fetch(`${base}/api/reports/options`),
      fetch(`${base}/api/states`),
    ])
      .then(async ([leadersRes, crewRes, reportsRes, statesRes]) => {
        const [leaders, crews, reportsData, states] = await Promise.all([
          leadersRes.json(),
          crewRes.json(),
          reportsRes.json(),
          statesRes.json(),
        ]);
        setNameLeader(Array.isArray(leaders) ? leaders : []);
        setNumCrew(Array.isArray(crews) ? crews : []);
        setReports(Array.isArray(reportsData) ? reportsData : []);
        setStateAs(Array.isArray(states) ? states : []);
      })
      .catch(err => console.error('failed loading form data', err));
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    fetch(`${base}/api/assignments/${selectedId}`)
      .then(res => res.json())
      .then(data => {
        setFormValues({
          Name_Leader: data.Name_Leader || '',
          Num_Crew: data.Num_Crew || '',
          Report_ID: data.Report_ID || '',
          StateAs: data.StateAs || '',
          Fecha: data.Date_time ? data.Date_time.split('T')[0] : ''
        });
      })
      .catch(err => console.error('failed loading assignment details', err));
  }, [selectedId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(v => ({ ...v, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selecciona una asignación',
        text: 'Debes seleccionar una asignación para actualizar.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const idNum = Number(selectedId);
    if (isNaN(idNum)) {
      await Swal.fire({
        icon: 'error',
        title: 'ID inválido',
        text: `El ID seleccionado no es válido: ${selectedId}`,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    setMessage({ type: '', text: '' });

    if (!formValues.Name_Leader) {
      await Swal.fire({
        icon: 'warning',
        title: 'Líder requerido',
        text: 'Debes seleccionar un líder para la asignación.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const normalizedCrew = parseInt(formValues.Num_Crew, 10);
    if (!Number.isInteger(normalizedCrew) || normalizedCrew <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Cuadrilla requerida',
        text: 'Debes seleccionar una cuadrilla válida.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const normalizedReport = parseInt(formValues.Report_ID, 10);
    if (!Number.isInteger(normalizedReport) || normalizedReport <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Reporte requerido',
        text: 'Debes seleccionar un reporte válido.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!formValues.Fecha) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fecha requerida',
        text: 'Debes seleccionar la fecha de la asignación.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!formValues.StateAs) {
      await Swal.fire({
        icon: 'warning',
        title: 'Estado requerido',
        text: 'Debes seleccionar el estado de la asignación.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    setLoading(true);

    const payload = {
      Name_Leader: formValues.Name_Leader,
      Num_Crew: normalizedCrew,
      Report_ID: normalizedReport,
      StateAs: formValues.StateAs,
      Date_Time: formValues.Fecha
    };

    try {
      const res = await fetch(`${base}/api/assignments/${selectedId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...buildSessionHeaders(getSession()),
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Error al actualizar asignación');
      }

      setMessage({ type: 'success', text: 'Asignación actualizada correctamente' });
      await Swal.fire({
        icon: 'success',
        title: 'Asignación actualizada',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonText: 'Aceptar',
      });
      loadAssignments();
    } catch (err) {
      const errorMessage = err?.message || 'No se pudo actualizar la asignación';
      setMessage({ type: 'error', text: errorMessage });
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: errorMessage,
        confirmButtonText: 'Entendido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full px-2 sm:px-4 pb-6">
      <ButtonBack />

      <PageHeaderCard
        title="Modificar Asignación"
        description="Selecciona una asignación y actualiza sus datos."
      />

      <SectionCard>

        <div className="mt-5">
          <label htmlFor="selectedAssignment" className="block text-sm font-medium text-slate-700">Asignación a modificar</label>
          <select
            id="selectedAssignment"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-1 w-full sm:w-md bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
          >
            <option value="">Seleccione</option>
            {assignments.map((assignment) => (
              <option key={assignment.Assigment_ID} value={assignment.Assigment_ID}>
                {showIds
                  ? `#${assignment.Assigment_ID} - ${assignment.Name_Leader || 'Sin líder'} - C${assignment.Num_Crew || '-'}`
                  : `${assignment.Name_Leader || 'Sin líder'} - C${assignment.Num_Crew || '-'}`}
              </option>
            ))}
          </select>
        </div>

        {selectedId ? (
          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4" noValidate>
            <div>
              <label htmlFor="Name_Leader" className="block text-sm font-medium text-slate-700">Nombre Líder</label>
              <select
                id="Name_Leader"
                name="Name_Leader"
                value={formValues.Name_Leader}
                onChange={handleChange}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
                required
              >
                <option value="">Seleccione</option>
                {nameleader.map((leader, idx) => (
                  <option key={idx} value={leader.Name_Leader}>
                    {leader.Name_Leader}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="Num_Crew" className="block text-sm font-medium text-slate-700">Num Cuadrilla</label>
              <select
                id="Num_Crew"
                name="Num_Crew"
                value={formValues.Num_Crew}
                onChange={handleChange}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
                required
              >
                <option value="">Seleccione</option>
                {numcrew.map((crew, idx) => (
                  <option key={idx} value={crew.Num_Crew}>
                    {crew.Num_Crew}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="Report_ID" className="block text-sm font-medium text-slate-700">Reporte</label>
              <select
                id="Report_ID"
                name="Report_ID"
                value={formValues.Report_ID}
                onChange={handleChange}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
                required
              >
                <option value="">Seleccione</option>
                {reports.map((report) => (
                  <option key={report.Report_ID} value={report.Report_ID}>
                    {showIds ? `#${report.Report_ID} - ${report.Adress || 'Sin dirección'}` : `${report.Adress || 'Sin dirección'}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="Fecha" className="block text-sm font-medium text-slate-700">Fecha</label>
              <input
                id="Fecha"
                name="Fecha"
                type="date"
                value={formValues.Fecha}
                onChange={handleChange}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="StateAs" className="block text-sm font-medium text-slate-700">Estado</label>
              <select
                id="StateAs"
                name="StateAs"
                value={formValues.StateAs}
                onChange={handleChange}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
                required
              >
                <option value="">Seleccione</option>
                {stateas.map((a, idx) => (
                  <option key={idx} value={a.StateAs}>{a.StateAs}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              {message.text && (
                <div className={`p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-56 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Selecciona una asignación para habilitar el formulario.</p>
        )}
      </SectionCard>

      <div className="mt-8 overflow-x-auto rounded-lg shadow-md bg-white">
        <h3 className="text-xl font-semibold p-4">Asignaciones existentes</h3>
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              {showIds ? <th className="py-3 px-4 text-left text-sm font-medium">Asignación ID</th> : null}
              <th className="py-3 px-4 text-left text-sm font-medium">Líder</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Cuadrilla</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Reporte</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Estado</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={showIds ? 6 : 5} className="text-center py-4 text-gray-500">No hay datos</td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.Assigment_ID} className="border-b hover:bg-blue-50 transition">
                  {showIds ? <td className="py-3 px-4 text-sm text-gray-700">{assignment.Assigment_ID}</td> : null}
                  <td className="py-3 px-4 text-sm text-gray-700">{assignment.Name_Leader}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{assignment.Num_Crew}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{showIds ? `#${assignment.Report_ID}` : (assignment.Report_Adress || 'Reporte asignado')}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{assignment.StateAs}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <button
                      type="button"
                      onClick={() => setSelectedId(String(assignment.Assigment_ID))}
                      className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UpdateAssignments;
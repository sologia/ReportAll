"use client";
import React, { useState, useEffect } from 'react';
import ButtonBack from '@/app/components/ButtonBack';
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
    <div>
      <ButtonBack />

      <h2>Modificar Asignación</h2>

      {selectedId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label>Nombre Líder:</label>
            <select
              name="Name_Leader"
              value={formValues.Name_Leader}
              onChange={handleChange}
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
            <label>Num Cuadrilla:</label>
            <select
              name="Num_Crew"
              value={formValues.Num_Crew}
              onChange={handleChange}
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
            <label>Reporte:</label>
            <select
              name="Report_ID"
              value={formValues.Report_ID}
              onChange={handleChange}
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
            <label>Fecha:</label>
            <input
              name="Fecha"
              type="date"
              value={formValues.Fecha}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Estado:</label>
            <select
              name="StateAs"
              value={formValues.StateAs}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              {stateas.map((a, idx) => (
                <option key={idx} value={a.StateAs}>{a.StateAs}</option>
              ))}
            </select>
          </div>

          {message.text && (
            <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

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
    </div>
  );
};

export default UpdateAssignments;
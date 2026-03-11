"use client";
import React, { useState, useEffect } from 'react';

const UpdateAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [nameleader, setNameLeader] = useState([]);
  const [numcrew, setNumCrew] = useState([]);
  const [namepath, setNamePath] = useState([]);
  const [stateas, setStateAs] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formValues, setFormValues] = useState({
    Name_Leader: '',
    Num_Crew: '',
    Name_Path: '',
    StateAs: '',
    Fecha: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
fetch(`${base}/api/assignments`)
  .then(res => res.json())
  .then(data => {
    console.log('Datos completos:', data);
   
    setAssignments(data);
  })
    fetch(`${base}/api/leaders`)
      .then(res => res.json())
      .then(data => setNameLeader(data))
      .catch(err => console.error('failed loading leaders', err));
    fetch(`${base}/api/crewsonly`)
      .then(res => res.json())
      .then(data => setNumCrew(data))
      .catch(err => console.error('failed loading crewsonly', err));
    fetch(`${base}/api/paths`)
      .then(res => res.json())
      .then(data => setNamePath(data))
      .catch(err => console.error('failed loading paths', err));
    fetch(`${base}/api/states`)
      .then(res => res.json())
      .then(data => setStateAs(data))
      .catch(err => console.error('failed loading states', err));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/assignments/${selectedId}`)
      .then(res => res.json())
      .then(data => {
        setFormValues({
          Name_Leader: data.Name_Leader || '',
          Num_Crew: data.Num_Crew || '',
          Name_Path: data.Name_Path || '',
          StateAs: data.StateAs || '',
          Fecha: data.Fecha ? data.Fecha.split('T')[0] : '' // formatear fecha si viene como ISO
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
      setMessage({ type: 'error', text: 'Debe seleccionar una asignación' });
      return;
    } 
    const idNum = Number(selectedId);
  if (isNaN(idNum)) {
   alert('El ID seleccionado no es válido. Valor recibido: ' + selectedId);
    return;
  }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const payload = {
      Name_Leader: formValues.Name_Leader,
      Num_Crew: parseInt(formValues.Num_Crew, 10) || 0,
      Name_Path: formValues.Name_Path,
      StateAs: formValues.StateAs,
      Date_Time: formValues.Fecha // Cambiado de DateTime a Date_Time
    };

    console.log('update payload', payload);

    try {
      const res = await fetch(`${base}/api/assignments/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

  

      console.log('updated', data);
      setMessage({ type: 'success', text: 'Asignación actualizada correctamente' });
      // Opcional: recargar la lista de asignaciones
      // fetch(`${base}/api/assignments`).then(res => res.json()).then(setAssignments);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Modificar Asignación</h2>
      <div className="mb-4">
        <label className="mr-2">Elige Asignación:</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">--</option>
          {assignments.map(c => (
            <option key={c.Assigment_ID} value={c.Assigment_ID}>
              {c.Name_Leader} - {c.Name_Path} - {c.StateAs}
            </option>
          ))}
        </select>
      </div>

      {selectedId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label>Nombre Ruta:</label>
            <select
              name="Name_Path"
              value={formValues.Name_Path}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              {namepath.map((path, idx) => (
                <option key={idx} value={path.Name_Path}>
                  {path.Name_Path}
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
    </div>
  );
};

export default UpdateAssignments;
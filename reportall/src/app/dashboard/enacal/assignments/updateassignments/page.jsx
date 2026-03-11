"use client";
import React, { useState, useEffect } from 'react';

const UpdateAssignments = () => {
  const [assigments, setAssigments] = useState([]);
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
    Fecha :''

  });
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/assigments`)
      .then(res => res.json())
      .then(data => setAssigments(data))
      .catch(err => console.error('failed loading assigments', err));
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
  }
, []);
  useEffect(() => {
    if (!selectedId) return;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/assigments/${selectedId}`)
      .then(res => res.json())
      .then(data => {
        setFormValues({
          Name_Leader: data.Name_Leader || '',
          Num_Crew: data.Num_Crew || '',
          Name_Path: data.Name_Path || '',
          StateAs: data.StateAs || '',
          Fecha: data.Fecha || ''
        });
      })
      .catch(err => console.error('failed loading crew details', err));
  }, [selectedId]);

 const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(v => ({ ...v, [name]: value }));
  };
   const handleSubmit = e => {
    e.preventDefault();
    if (!selectedId) return;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const payload = {
      Name_Leader: formValues.Name_Leader,
      Num_Crew: parseInt(formValues.Num_Crew, 10),
      Name_Path: formValues.Name_Path,
      StateAs: formValues.StateAs,
      DateTime : formValues.Fecha
    };
    console.log('update payload', payload);
    fetch(`${base}/api/assigments/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => console.log('updated', data))
      .catch(err => console.error('update error', err));
  };
  return (
     <div>
      <h2>Modificar Asignacion</h2>
      <div className="mb-4">
        <label className="mr-2">Elige Asignacion:</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">--</option>
          {assigments.map(c => (
            <option key={c.Assigment_ID} value={c.Assigment_ID}>
              {c.Name_Leader} - {c.Num_Crew} - {c.Name_Path}
               
            </option>
            
          ))}
        </select>
      </div>

      {selectedId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label>Nombre Lider:</label>
            <select
              name="Name_Leader"
              value={formValues.Name_Leader}
              onChange={handleChange}
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
            <label>Fecha :</label>
           <input
              name="Fecha"
              type="date"
              value={formValues.Fecha}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Estado :</label>
            <select
              name="StateAs"
              value={formValues.StateAs}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {stateas.map((a, idx) => (
                <option key={idx} value={a.StateAs}>{a.StateAs}</option>
              ))}
            </select>
          </div>
          <button type="submit">Guardar</button>
        </form>
      )}
    </div>
  )
}

export default UpdateAssignments
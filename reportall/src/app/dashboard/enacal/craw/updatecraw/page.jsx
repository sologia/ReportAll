"use client";
import React, { useState, useEffect } from 'react';

const UpdateCraw = () => {
  const [crews, setCrews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formValues, setFormValues] = useState({
    Num_Crew: '',
    Plate: '',
    Sector: '',
    Availability: 'Disponible'
  });

  // load crews list for dropdown
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(data => setCrews(data))
      .catch(err => console.error('failed loading crews', err));

    // also load vehicles and sectors so we can reuse selects
    fetch(`${base}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('failed loading vehicles', err));

    fetch(`${base}/api/sectors`)
      .then(res => res.json())
      .then(data => setSectors(data))
      .catch(err => console.error('failed loading sectors', err));

    fetch(`${base}/api/availabilities`)
      .then(res => res.json())
      .then(data => setAvailabilities(data))
      .catch(err => console.error('failed loading availabilities', err));
  }, []);

  // load selected crew details
  useEffect(() => {
    if (!selectedId) return;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/crews/${selectedId}`)
      .then(res => res.json())
      .then(data => {
        setFormValues({
          Num_Crew: data.Num_Crew || '',
          Plate: data.Plate || '',
          Sector: data.Name_Sector || '',
          Availability: data.Availability_Crew || 'Disponible'
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
      Availability: formValues.Availability,
      Sector: formValues.Sector,
      Plate: formValues.Plate,
      Num_Crew: parseInt(formValues.Num_Crew, 10)
    };
    console.log('update payload', payload);
    fetch(`${base}/api/crews/${selectedId}`, {
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
      <h2>Modificar Cuadrilla</h2>
      <div className="mb-4">
        <label className="mr-2">Elige cuadrilla:</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">--</option>
          {crews.map(c => (
            <option key={c.Crew_ID || c.Num_Crew} value={c.Crew_ID || c.Num_Crew}>
              {c.Num_Crew} - {c.Name_Sector}
            </option>
          ))}
        </select>
      </div>

      {selectedId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label>Num Cuadrilla:</label>
            <input
              name="Num_Crew"
              type="number"
              value={formValues.Num_Crew}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Matrícula:</label>
            <select
              name="Plate"
              value={formValues.Plate}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {vehicles.map((v, idx) => (
                <option key={idx} value={v.Plate}>{v.Plate}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Sector:</label>
            <select
              name="Sector"
              value={formValues.Sector}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {sectors.map((s, idx) => (
                <option key={idx} value={s.Name_Sector}>{s.Name_Sector}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Disponibilidad:</label>
            <select
              name="Availability"
              value={formValues.Availability}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {availabilities.map((a, idx) => (
                <option key={idx} value={a.Availability_Crew}>{a.Availability_Crew}</option>
              ))}
            </select>
          </div>
          <button type="submit">Guardar</button>
        </form>
      )}
    </div>
  );
};

export default UpdateCraw
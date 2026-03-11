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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // URL base (ajusta según tu entorno)
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Cargar listas al montar
  useEffect(() => {
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(data => {
        console.log('Crews cargados:', data);
        setCrews(data);
      })
      .catch(err => console.error('Error cargando crews:', err));

    fetch(`${base}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error cargando vehículos:', err));

    fetch(`${base}/api/sectors`)
      .then(res => res.json())
      .then(data => setSectors(data))
      .catch(err => console.error('Error cargando sectores:', err));

    fetch(`${base}/api/availabilities`)
      .then(res => res.json())
      .then(data => setAvailabilities(data))
      .catch(err => console.error('Error cargando disponibilidades:', err));
  }, [base]);

  // Cargar detalles de la cuadrilla seleccionada
useEffect(() => {
  if (!selectedId) return;
  const base = 'http://localhost:3001';
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
    .catch(err => console.error(err));
}, [selectedId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(v => ({ ...v, [name]: value }));
  };

 const handleSubmit = async e => {
  e.preventDefault();
  if (!selectedId) {
    setMessage('Por favor selecciona una cuadrilla');
    return;
  }
  const idNum = Number(selectedId);
  if (isNaN(idNum)) {
    setMessage('El ID seleccionado no es válido');
    return;
  }

  setLoading(true);
  setMessage('');

  // Asegurar que ningún campo sea undefined
  const payload = {
    Num_Crew: parseInt(formValues.Num_Crew, 10) || 0,
    Plate: formValues.Plate || '',
    Sector: formValues.Sector || '',
    Availability: formValues.Availability || 'Disponible'
  };

  try {
    const res = await fetch(`http://localhost:3001/api/crews/${idNum}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error al actualizar');
    }

    setMessage('¡Cuadrilla actualizada correctamente!');
    console.log('Actualizado:', data);
  } catch (err) {
    console.error('Error:', err);
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div>
      <h2>Modificar Cuadrilla</h2>
      {message && (
        <div className={`p-2 mb-4 rounded ${
          message.includes('correctamente') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      <div className="mb-4">
        <label className="mr-2">Elige cuadrilla:</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          disabled={loading}
        >
          <option value="">--</option>
          {crews.map(c => (
            <option key={c.Crew_ID} value={c.Crew_ID}>
              {c.Num_Crew} - {c.Name_Sector || 'Sin sector'}
            </option>
          ))}
        </select>
      </div>

      {selectedId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label>Número de Cuadrilla:</label>
            <input
              name="Num_Crew"
              type="number"
              value={formValues.Num_Crew}
              onChange={handleChange}
              disabled={loading}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label>Matrícula del vehículo:</label>
            <select
              name="Plate"
              value={formValues.Plate}
              onChange={handleChange}
              disabled={loading}
              className="border p-2 rounded"
            >
              <option value="">Seleccione</option>
              {vehicles.map(v => (
                <option key={v.Vehicle_ID || v.Plate} value={v.Plate}>
                  {v.Plate}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Sector:</label>
            <select
              name="Sector"
              value={formValues.Sector}
              onChange={handleChange}
              disabled={loading}
              className="border p-2 rounded"
            >
              <option value="">Seleccione</option>
              {sectors.map(s => (
                <option key={s.Sector_ID || s.Name_Sector} value={s.Name_Sector}>
                  {s.Name_Sector}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Disponibilidad:</label>
            <select
              name="Availability"
              value={formValues.Availability}
              onChange={handleChange}
              disabled={loading}
              className="border p-2 rounded"
            >
              <option value="">Seleccione</option>
              {availabilities.map(a => (
                <option key={a.Availability_Crew_ID || a.Availability_Crew} value={a.Availability_Crew}>
                  {a.Availability_Crew}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateCraw;
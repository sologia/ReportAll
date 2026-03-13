"use client";
import React, { useState, useEffect } from 'react';
import ButtonBack from '@/app/components/ButtonBack';

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
    const res = await fetch(`${base}/api/crews/${idNum}`, {
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
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(data => setCrews(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error recargando cuadrillas:', err));
  } catch (err) {
    console.error('Error:', err);
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div>
      <ButtonBack />

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

      <div className="mt-8 overflow-x-auto rounded-lg shadow-md bg-white">
        <h3 className="text-xl font-semibold p-4">Cuadrillas existentes</h3>
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium">Crew ID</th>
              <th className="py-3 px-4 text-left text-sm font-medium">N° Cuadrilla</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Sector</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Estado</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Placa</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {crews.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No hay datos</td>
              </tr>
            ) : (
              crews.map((crew) => (
                <tr key={crew.Crew_ID} className="border-b hover:bg-blue-50 transition">
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Crew_ID}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Num_Crew}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Name_Sector}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Availability_Crew}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Plate}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <button
                      type="button"
                      onClick={() => setSelectedId(String(crew.Crew_ID))}
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

export default UpdateCraw;
"use client";
import React, { useState, useEffect } from 'react';
import ButtonBack from '@/app/components/ButtonBack';
import PageHeaderCard from '@/app/components/PageHeaderCard';
import SectionCard from '@/app/components/SectionCard';
import StateBadge from '@/app/components/StateBadge';
import TablePaginationControls from '@/app/components/TablePaginationControls';
import Swal from 'sweetalert2';
import { getSession } from '@/lib/auth';
import { canViewIds, normalizeRole } from '@/lib/rbac';
import { useTablePagination } from '@/hooks/useTablePagination';

const UpdateCraw = () => {
  const role = normalizeRole(getSession()?.role);
  const showIds = canViewIds(role);
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
  const {
    paginatedRows,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    handlePageSizeChange,
    setCurrentPage,
  } = useTablePagination(crews);

  const base = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    Promise.all([
      fetch(`${base}/api/crews`),
      fetch(`${base}/api/vehicles`),
      fetch(`${base}/api/sectors`),
      fetch(`${base}/api/availabilities`),
    ])
      .then(async ([crewsRes, vehiclesRes, sectorsRes, availabilitiesRes]) => {
        const [crewsData, vehiclesData, sectorsData, availabilitiesData] = await Promise.all([
          crewsRes.json(),
          vehiclesRes.json(),
          sectorsRes.json(),
          availabilitiesRes.json(),
        ]);

        setCrews(Array.isArray(crewsData) ? crewsData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
        setAvailabilities(Array.isArray(availabilitiesData) ? availabilitiesData : []);
      })
      .catch(err => console.error('Error cargando catálogos de cuadrilla:', err));
  }, [base]);

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
      await Swal.fire({
        icon: 'warning',
        title: 'Selecciona una cuadrilla',
        text: 'Debes elegir una cuadrilla para actualizar.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
    const idNum = Number(selectedId);
    if (isNaN(idNum)) {
      setMessage('El ID seleccionado no es válido');
      await Swal.fire({
        icon: 'error',
        title: 'ID inválido',
        text: 'El ID seleccionado no es válido.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    setMessage('');

    const normalizedNumCrew = parseInt(formValues.Num_Crew, 10);
    if (!Number.isInteger(normalizedNumCrew) || normalizedNumCrew <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Número inválido',
        text: 'El número de cuadrilla debe ser un entero mayor que cero.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const duplicateCrew = crews.find((crew) => (
      Number(crew?.Num_Crew) === normalizedNumCrew && String(crew?.Crew_ID) !== String(selectedId)
    ));

    if (duplicateCrew) {
      await Swal.fire({
        icon: 'warning',
        title: 'Número duplicado',
        text: 'Ya existe otra cuadrilla registrada con ese número.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!formValues.Plate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes seleccionar la matrícula del vehículo.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!formValues.Sector) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sector requerido',
        text: 'Debes seleccionar un sector para la cuadrilla.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!formValues.Availability) {
      await Swal.fire({
        icon: 'warning',
        title: 'Disponibilidad requerida',
        text: 'Debes seleccionar la disponibilidad de la cuadrilla.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const payload = {
      Num_Crew: normalizedNumCrew,
      Plate: formValues.Plate || '',
      Sector: formValues.Sector || '',
      Availability: formValues.Availability || 'Disponible'
    };

    try {
      setLoading(true);
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
      await Swal.fire({
        icon: 'success',
        title: 'Cuadrilla actualizada',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonText: 'Aceptar',
      });
      fetch(`${base}/api/crews`)
        .then(res => res.json())
        .then(data => setCrews(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error recargando cuadrillas:', err));
    } catch (err) {
      console.error('Error:', err);
      setMessage(err.message);
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: err.message || 'No se pudo actualizar la cuadrilla',
        confirmButtonText: 'Entendido',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="w-full px-2 sm:px-4 pb-6">
      <ButtonBack />

      {/* <PageHeaderCard
        title="Modificar Cuadrilla"
        description="Actualiza datos de la cuadrilla seleccionada."
      /> */}

      <SectionCard>

        {message && (
          <div className={`p-2 mt-4 mb-2 rounded text-sm ${message.includes('correctamente') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {message}
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="selectedCrew" className="block text-sm font-medium text-slate-700">Cuadrilla a modificar</label>
          <select
            id="selectedCrew"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={loading}
            className="mt-1 w-full sm:w-md bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
          >
            <option value="">Seleccione</option>
            {crews.map(c => (
              <option key={c.Crew_ID} value={c.Crew_ID}>
                {showIds
                  ? `#${c.Crew_ID} - C${c.Num_Crew} - ${c.Name_Sector || 'Sin sector'}`
                  : `C${c.Num_Crew} - ${c.Name_Sector || 'Sin sector'}`}
              </option>
            ))}
          </select>
        </div>

        {selectedId ? (
          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4" noValidate>
            <div>
              <label htmlFor="Num_Crew" className="block text-sm font-medium text-slate-700">Número de Cuadrilla</label>
              <input
                id="Num_Crew"
                name="Num_Crew"
                type="number"
                value={formValues.Num_Crew}
                onChange={handleChange}
                disabled={loading}
                min={1}
                step={1}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="Plate" className="block text-sm font-medium text-slate-700">Matrícula del vehículo</label>
              <select
                id="Plate"
                name="Plate"
                value={formValues.Plate}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
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
              <label htmlFor="Sector" className="block text-sm font-medium text-slate-700">Sector</label>
              <select
                id="Sector"
                name="Sector"
                value={formValues.Sector}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
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
              <label htmlFor="Availability" className="block text-sm font-medium text-slate-700">Disponibilidad</label>
              <select
                id="Availability"
                name="Availability"
                value={formValues.Availability}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full bg-[#b2b1b1] rounded-2xl px-3 py-2 focus:outline-none"
              >
                <option value="">Seleccione</option>
                {availabilities.map(a => (
                  <option key={a.Availability_Crew_ID || a.Availability_Crew} value={a.Availability_Crew}>
                    {a.Availability_Crew}
                  </option>
                ))}
              </select>
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
          <p className="mt-4 text-sm text-slate-500">Selecciona una cuadrilla para habilitar el formulario.</p>
        )}
      </SectionCard>

      <div className="mt-8 overflow-x-auto rounded-lg shadow-md bg-white">
        <h3 className="text-xl font-semibold p-4">Cuadrillas existentes</h3>
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              {showIds ? <th className="py-3 px-4 text-left text-sm font-medium">Crew ID</th> : null}
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
                <td colSpan={showIds ? 6 : 5} className="text-center py-4 text-gray-500">No hay datos</td>
              </tr>
            ) : (
              paginatedRows.map((crew) => (
                <tr key={crew.Crew_ID} className="border-b hover:bg-blue-50 transition">
                  {showIds ? <td className="py-3 px-4 text-sm text-gray-700">{crew.Crew_ID}</td> : null}
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Num_Crew}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{crew.Name_Sector}</td>
                  <td className="py-3 px-4 text-sm text-gray-700"><StateBadge value={crew.Availability_Crew} /></td>
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
        <TablePaginationControls
          totalItems={totalItems}
          startItem={startItem}
          endItem={endItem}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
};

export default UpdateCraw;
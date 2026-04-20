'use client'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import SectionCard from '@/app/components/SectionCard'
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

const CreateCraw = () => {
  const [vehicles, setVehicles] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [crews, setCrews] = useState([]);

  const defaultAvailability = 'Disponible';
  const base = process.env.NEXT_PUBLIC_API_URL || '';

  const crewColumns = [
    { header: 'Crew ID', field: 'Crew_ID' },
    { header: 'N° Cuadrilla', field: 'Num_Crew' },
    { header: 'Sector', field: 'Name_Sector' },
    { header: 'Estado', field: 'Availability_Crew' },
    { header: 'Placa', field: 'Plate' },
  ];

  const loadCrews = () => {
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(data => setCrews(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando cuadrillas existentes', err));
  }

  useEffect(() => {
    Promise.all([
      fetch(`${base}/api/vehicles`),
      fetch(`${base}/api/sectors`),
    ])
      .then(async ([vehiclesRes, sectorsRes]) => {
        const [vehiclesData, sectorsData] = await Promise.all([
          vehiclesRes.json(),
          sectorsRes.json(),
        ]);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
      })
      .catch(err => console.error('Error cargando catálogos de cuadrillas', err));

    loadCrews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const numCrewValue = parseInt(form.num_cuadrilla.value, 10);
    const selectedPlate = form.opciones_vehiculos.value;
    const selectedSector = form.opciones_sectores.value;

    if (!Number.isInteger(numCrewValue) || numCrewValue <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Número inválido',
        text: 'El número de cuadrilla debe ser un entero mayor que cero.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!selectedPlate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes seleccionar la matrícula del vehículo.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!selectedSector) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sector requerido',
        text: 'Debes seleccionar un sector para la cuadrilla.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const payload = {
      Availability: defaultAvailability,
      Sector: selectedSector,
      Plate: selectedPlate,
      Num_Crew: numCrewValue,
    };

    try {
      const response = await fetch(`${base}/api/crews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'No se pudo crear la cuadrilla')
      }

      form.reset()
      loadCrews();
      await Swal.fire({
        icon: 'success',
        title: 'Cuadrilla creada',
        text: 'La cuadrilla se registró correctamente.',
        confirmButtonText: 'Aceptar',
      })
    } catch (err) {
      console.error('Error creating crew', err)
      await Swal.fire({
        icon: 'error',
        title: 'Error al crear',
        text: err.message || 'No se pudo crear la cuadrilla',
        confirmButtonText: 'Entendido',
      })
    }
  };

  return (
    <section className='w-full px-2 sm:px-4 pb-6'>
      
      <div>
        <ButtonBack/>
      </div>

      <PageHeaderCard
        title='Crear Cuadrilla'
        description='Registra cuadrillas con su vehículo y sector correspondiente.'
      />

      <SectionCard>
      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row xl:justify-between items-start gap-6" noValidate>

        <div className='flex flex-col gap-4 w-full'>
          
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
            <label htmlFor="num_cuadrilla" className='w-full sm:w-36'>N° Cuadrilla</label>
            <input
              type="number"
              id="num_cuadrilla"
              name="num_cuadrilla"
              className="bg-[#b2b1b1] rounded-2xl w-full sm:w-64 px-3 py-2"
              min={1}
              step={1}
              required
            />
          </div>

          <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
            <label htmlFor="opciones_vehiculos" className='w-full sm:w-36'>Matrícula</label>
            <select
              name="opciones_vehiculos"
              id="opciones_vehiculos"
              className='bg-[#b2b1b1] rounded-2xl w-full sm:w-64 px-3 py-2'
              required
            >
              <option value="">Seleccione</option>
              {vehicles.map((v, idx) => (
                <option key={idx} value={v.Plate}>{v.Plate}</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center'>
            <label htmlFor='opciones_sectores' className='w-full sm:w-36'>Sector</label>
            <select
              name="opciones_sectores"
              id="opciones_sectores"
              className='bg-[#b2b1b1] rounded-2xl w-full sm:w-64 px-3 py-2'
              required
            >
              <option value="">Seleccione</option>
              {sectors.map((s, idx) => (
                <option key={idx} value={s.Name_Sector}>{s.Name_Sector}</option>
              ))}
            </select>
          </div>

          <input type="hidden" name="availability" value={defaultAvailability} />
        </div>

        <div className='flex flex-col gap-3 w-full xl:w-auto'>
          <button
                type="submit"
          className="w-full xl:w-56 mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Aceptar
          </button>

          <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full xl:w-56 mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Cancelar
            </button>
        </div>
      </form>
      </SectionCard>

      <div className='mt-10'>
        <h3 className='text-xl font-semibold'>Cuadrillas ya creadas</h3>
        <SimpleTable columns={crewColumns} data={crews} />
      </div>

    </section>
  )
}

export default CreateCraw

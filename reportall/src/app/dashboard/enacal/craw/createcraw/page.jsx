'use client'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useEffect, useState } from 'react'

const CreateCraw = () => {
  const [vehicles, setVehicles] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [crews, setCrews] = useState([]);

  // disponibilidad fija
  const defaultAvailability = 'Disponible';

  const crewColumns = [
    { header: 'Crew ID', field: 'Crew_ID' },
    { header: 'N° Cuadrilla', field: 'Num_Crew' },
    { header: 'Sector', field: 'Name_Sector' },
    { header: 'Estado', field: 'Availability_Crew' },
    { header: 'Placa', field: 'Plate' },
  ];

  const loadCrews = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(data => setCrews(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando cuadrillas existentes', err));
  }

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error cargando vehículos', err));

    fetch(`${base}/api/sectors`)
      .then(res => res.json())
      .then(data => setSectors(data))
      .catch(err => console.error('Error cargando sectores', err));

    loadCrews();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      Availability: defaultAvailability,
      Sector: form.opciones_sectores.value,
      // Plate string rather 
      Plate: form.opciones_vehiculos.value,
      Num_Crew: parseInt(form.num_cuadrilla.value, 10)
    };

    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/crews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Crew created', data);
        loadCrews();
      })
      .catch(err => console.error('Error creating crew', err));
  };

  return (
    <div>
      
      <div>
        <ButtonBack/>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-between items-start gap-9">

        <div className=' flex flex-col gap-4 ml-16'>
          
          <div className='flex gap-6 items-center'>
            <label htmlFor="num_cuadrilla" className='w-[90px]'>N° Cuadrilla</label>
            <input
              type="number"
              id="num_cuadrilla"
              name="num_cuadrilla"
              className="bg-[#b2b1b1] rounded-2xl w-32"
              required
            />
          </div>

          <div className='flex gap-6'>
            <label htmlFor="opciones_vehiculos" className='w-24'>Matrícula</label>
            <select
              name="opciones_vehiculos"
              id="opciones_vehiculos"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
            >
              <option value="">Seleccione</option>
              {vehicles.map((v, idx) => (
                <option key={idx} value={v.Plate}>{v.Plate}</option>
              ))}
            </select>
          </div>

          <div className='flex gap-6'>
            <label htmlFor='opciones_sectores' className='w-24'>Sector</label>
            <select
              name="opciones_sectores"
              id="opciones_sectores"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
            >
              <option value="">Seleccione</option>
              {sectors.map((s, idx) => (
                <option key={idx} value={s.Name_Sector}>{s.Name_Sector}</option>
              ))}
            </select>
          </div>

          {/* disponibilidad oculta */}
          <input type="hidden" name="availability" value={defaultAvailability} />
        </div>

        <div className='flex flex-col gap-3 mr-16'>
          <button
                type="submit"
              //   value='Login'
                className="w-70 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Aceptar
          </button>

          <button
                type="submit"
              //   value='Login'
                className="w-70 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Cancelar
            </button>
        </div>
      </form>

      <div className='mt-10'>
        <h3 className='text-xl font-semibold'>Cuadrillas ya creadas</h3>
        <SimpleTable columns={crewColumns} data={crews} />
      </div>

    </div>
  )
}

export default CreateCraw


{/* <form action="/action_page.php">
  <label for="cars">Choose a car:</label>
  <select name="cars" id="cars">
    <optgroup label="Swedish Cars">
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
    </optgroup>
    <optgroup label="German Cars">
      <option value="mercedes">Mercedes</option>
      <option value="audi">Audi</option>
    </optgroup>
  </select>
  <br><br>
  <input type="submit" value="Submit">
</form>
 
</body>
</html> */}
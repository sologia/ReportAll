'use client'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useEffect, useState } from 'react'

const CreateAssignments = () => {
const [numcrew, setNumCrew] = useState([]);
const [reports, setReports] = useState([]);
const [assignments, setAssignments] = useState([]);
const [crewInfo, setCrewInfo] = useState([]);
const [stateAs, setStateAs] = useState([]);
const [leader, setLeader] = useState([]);

const unassignedReports = reports.filter((report) => {
  const isAssigned = assignments.some((assignment) => Number(assignment.Report_ID) === Number(report.Report_ID));
  return !isAssigned;
});

const unassignedReportsColumns = [
  { header: 'Reporte ID', field: 'Report_ID' },
  { header: 'Direccion', field: 'Adress' },
  { header: 'Problema', field: 'Name_Problem' },
  { header: 'Urgencia', field: 'Urgency' },
];

const crewInfoColumns = [
  { header: 'Crew ID', field: 'Crew_ID' },
  { header: 'Numero Cuadrilla', field: 'Num_Crew' },
  { header: 'Disponibilidad', field: 'Availability_Crew' },
  { header: 'Sector', field: 'Name_Sector' },
  { header: 'Placa', field: 'Plate' },
];

 useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/leaders`)
      .then(res => res.json())
      .then(data => setLeader(data))
      .catch(err => console.error('Error cargando lideres', err));
    fetch(`${base}/api/crewsonly`)
      .then(res => res.json())
      .then(data => setNumCrew(data))
      .catch(err => console.error('Error cargando cuadrillas', err));
        fetch(`${base}/api/states`)
      .then(res => res.json())
      .then(data => setStateAs(data))
      .catch(err => console.error('Error cargando estados', err));

    fetch(`${base}/api/reports/options`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error('Error cargando reportes', err));

    fetch(`${base}/api/assignments`)
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error('Error cargando asignaciones', err));

    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(data => setCrewInfo(data))
      .catch(err => console.error('Error cargando informacion de cuadrillas', err));
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      Name_Leader: form.opciones_lider.value,
      Num_Crew: parseInt(form.opciones_cuadrillas.value, 10),
      Report_ID: parseInt(form.opciones_reporte.value, 10),
      Date_Time: form.date.value,
      StateAs: form.opciones_estados.value
    };
    // Aquí manejas el envío del formulario
    console.log('Formulario enviado');
 
   const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Assignment created', data);
        // optionally navigate away or show a message
      })
      .catch(err => console.error('Error creating assignment', err));

 };
  return (
    <div>
      
      <div>
        <ButtonBack/>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-between items-start gap-9">

        <div className='flex flex-col gap-4 ml-16'>
          
          <div className='flex gap-6 items-center'>
            <label htmlFor="date" className='w-[90px]'>Fecha dd/mm/aa </label>
            <input
              type="date"
              id="date"
              name="date"
              className="bg-[#b2b1b1] rounded-2xl w-32"
              required
            />
           </div>
          {/* parte de abajo */}
           
            <div className='flex gap-6 items-center'>
              <label form="opciones_lider" className='w-24'>Nombre Lider</label>
              <select 
                name="opciones_lider"
              id="opciones_lider"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
              >
              <option value="">Seleccione</option>
              {leader.map((t, idx) => (
                <option key={idx} value={t.Name_Leader}>{t.Name_Leader}</option>
              ))}
              </select>
            </div>
            <div className='flex gap-6 items-center'>
              <label form="opciones_cuadrillas" className='w-24'>Cuadrilla</label>
              <select 
                name="opciones_cuadrillas"
              id="opciones_cuadrillas"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
              >
              <option value="">Seleccione</option>
              {numcrew.map((c, idx) => (
                <option key={idx} value={c.Num_Crew}>{c.Num_Crew}</option>
              ))}
              </select>
            </div>

            <div className='flex gap-6 items-center'>
              <label form='opciones_reporte' className='w-24'>Reporte</label>
               <select 
                name="opciones_reporte"
              id="opciones_reporte"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
             >
              <option value="">Seleccione</option>
              {reports.map((report) => (
                <option key={report.Report_ID} value={report.Report_ID}>
                  {`#${report.Report_ID} - ${report.Adress || 'Sin dirección'}`}
                </option>
              ))}
              </select>
            </div>
            

            <div className='flex gap-6 items-center'>
              <label form='opciones_estados' className='w-24'>Estado</label>
              <select 
                name="opciones_estados"
              id="opciones_estados"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
              >
              <option value="">Seleccione</option>
              {stateAs.map((s, idx) => (
                <option key={idx} value={s.StateAs}>{s.StateAs}</option>
              ))}
              </select>
            </div>

        
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
        <h3 className='text-xl font-semibold'>Reportes no asignados</h3>
        <SimpleTable columns={unassignedReportsColumns} data={unassignedReports} />
      </div>

      <div className='mt-10'>
        <h3 className='text-xl font-semibold'>Informacion de las cuadrillas</h3>
        <SimpleTable columns={crewInfoColumns} data={crewInfo} />
      </div>

    </div>
  )
}

export default CreateAssignments


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
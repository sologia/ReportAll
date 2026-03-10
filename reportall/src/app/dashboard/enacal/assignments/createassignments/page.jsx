'use client'
import ButtonBack from '@/app/components/ButtonBack'
import React, { useEffect, useState } from 'react'

const CreateAssignments = () => {


const [numcrew, setNumCrew] = useState([]);
const [namepath, setNamePath] = useState([]);
const [stateAs, setStateAs] = useState([]);
 const [crews, setCrews] = useState([]);
 const [leader, setLeader] = useState([]);
 useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/leaders`)
      .then(res => res.json())
      .then(data => setLeader(data))
      .catch(err => console.error('Error cargando lideres', err));
    fetch(`${base}/api/crewsonly`)
      .then(res => res.json())
      .then(data => setCrews(data))
      .catch(err => console.error('Error cargando cuadrillas', err));
        fetch(`${base}/api/states`)
      .then(res => res.json())
      .then(data => setStateAs(data))
      .catch(err => console.error('Error cargando estados', err));

    fetch(`${base}/api/paths`)
      .then(res => res.json())
      .then(data => setNamePath(data))
      .catch(err => console.error('Error cargando rutas', err));
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      Name_Leader: form.opciones_lider.value,
      Num_Crew: parseInt(form.opciones_cuadrillas.value, 10),
      Name_Path: form.opciones_ruta.value,
      Date_Time: form.date.value,
      StateAs: form.opciones_estados.value
    
      
    };
    // Aquí manejas el envío del formulario
    console.log('Formulario enviado');
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
              type="text"
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
              {crews.map((c, idx) => (
                <option key={idx} value={c.Crew_ID}>{c.Crew_ID}</option>
              ))}
              </select>
            </div>

            <div className='flex gap-6 items-center'>
              <label form='opciones_ruta' className='w-24'>Nombre Ruta</label>
               <select 
                name="opciones_ruta"
              id="opciones_ruta"
              className='bg-[#b2b1b1] rounded-2xl w-32'
              required
             >
              <option value="">Seleccione</option>
              {namepath.map((s, idx) => (
                <option key={idx} value={s.Name_Path}>{s.Name_Path}</option>
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
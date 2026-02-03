'use client'
import ButtonBack from '@/app/components/ButtonBack'


const CreateAssignments = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <label htmlFor="" className='w-[100px]'>N° Asignacion</label>
            <p>Aca ira un numero que se auto incremente</p>
          </div>

          {/* parte de abajo */}
          <div className='flex flex-col gap-4 '>

            <div className='flex gap-6 items-center'>
              <label form="opciones_vehiculos" className='w-24'>Cuadrilla</label>
              <select name="opciones_vehiculos" id="opciones_vehiculos" className='bg-[#b2b1b1] rounded-2xl w-12'>
                <option value="">1</option>
                <option value="">2</option>
                <option value="">3</option>
              </select>
            </div>

            <div className='flex gap-6 items-center'>
              <label form='opciones_sectores' className='w-24'>Sector</label>
              <select name="opciones_sectores" id="opciones_sectores" className='bg-[#b2b1b1] rounded-2xl w-12'>
                <option value="">1</option>
                <option value="">2</option>
                <option value="">3</option>
              </select>
            </div>

            <div className='flex gap-6 items-center'>
              <label form='opciones_sectores' className='w-24'>Reporte</label>
              <select name="opciones_sectores" id="opciones_sectores" className='bg-[#b2b1b1] rounded-2xl w-12'>
                <option value="">1</option>
                <option value="">2</option>
                <option value="">3</option>
              </select>
            </div>

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
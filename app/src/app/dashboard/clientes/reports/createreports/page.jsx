'use client'
import ButtonBack from '@/app/components/ButtonBack'
import MultiFileUpload from '@/app/components/MultiFileUpload';
import MyMap from '@/app/page';
import { useRef, useState } from 'react';

const CreateReportClient = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí manejas el envío del formulario
    console.log('Formulario enviado');
  };

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div>
      
      <div>
        <ButtonBack/>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <div className=' flex flex-col gap-4 ml-15'>
          
          <div className='flex'>
            {/* <label htmlFor="" className='w-[90px]'>N° Cuadrilla</label> */}
            <p className='m-auto text-[32px] font-bold'>Datos del problema</p>
          </div>

          <div className='flex gap-6'>
            <label form="opciones_problemas" className='w-46'>Selecciona un problema</label>
            <select name="opciones_problemas" id="opciones_problemas" className='bg-[#b2b1b1] rounded-2xl w-12'>
              <option value="">Tubo roto de agua potable</option>
              <option value="">Medidor dañado</option>
              <option value="">Problemas del sistema de alcantarillado sanitario(manjol rebalsado o sintaba)</option>
            </select>
          </div>

          
          <div className='flex gap-6'>

            <label className='w-46'>Subir imagenes/videos</label>
            <div>
              <MultiFileUpload/>
            </div>
          </div>

        </div>

        <div className=''>
          <p className='ml-6 text-[20px]'>Seleccione la ubicacion del problema</p>
          <MyMap/>
        </div>

        <div className='flex mb-6'>
          <button
                type="submit"
              //   value='Login'
                className="w-70 ml-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Aceptar
          </button>
        </div>
      </form>
      

    </div>
  )
}

export default CreateReportClient
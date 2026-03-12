'use client'
import ButtonBack from '@/app/components/ButtonBack'
import MultiFileUpload from '@/app/components/MultiFileUpload';
// import MyMap from '@/app/page';
import dynamic from 'next/dynamic';
const MyMap = dynamic(() => import('@/app/components/MyMap'), { ssr: false });
import { useForm } from '@/hooks/useForm';
import { useState, useEffect } from 'react';


const ReportFields = {
  tipoReporte: '',
}

const CreateReportClient = () => {

  const { tipoReporte, onInputChange: onReportInputChange } = useForm(ReportFields);

  const [coords, setCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const location = [coords.latitude, coords.longitude];
          setCurrentLocation(location);
          setCoords(location);
        },
        (err) => console.warn('Error obteniendo ubicación:', err)
      );
    }
  }, []);

  const handleMapSelect = ([lat, lng]) => {
    setCoords([lat, lng]);
  };

  const handleUseMyLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setCoords([coords.latitude, coords.longitude]),
        (err) => console.warn('Error obteniendo ubicación:', err)
      );
    }
  };

  const ReportSubmit = (e) => {
    e.preventDefault();
    console.log('coords:', coords);
  };


  return (
    <div>

      <div>
        <ButtonBack />
      </div>

      <form onSubmit={ReportSubmit} className="flex flex-col gap-6">

        <div className=' flex flex-col gap-4 ml-15'>

          <div className='flex'>
            <p className='m-auto text-[32px] font-bold'>Datos del problema</p>
          </div>

          <div className="flex gap-6 items-center">

            <label className='w-56'>Selecciona un problema</label>
            <select
              name="tipoReporte"
              value={tipoReporte}
              onChange={onReportInputChange}
              className='bg-[#b2b1b1] rounded-2xl w-64'
            >
              <option value="Tubo roto de agua potable">Tubo roto de agua potable</option>
              <option value="Medidor dañado">Medidor dañado</option>
              <option value="Problemas del sistema de alcantarillado sanitario(manjol rebalsado o sintaba)">Problemas del sistema de alcantarillado sanitario(manjol rebalsado o sintaba)</option>
            </select>
          </div>

          <div className="flex gap-6 items-center">
            <label htmlFor='opciones_sectores' className='w-56'>Sector</label>
            <select
              name="opciones_sectores"
              id="opciones_sectores"
              className='bg-[#b2b1b1] rounded-2xl w-64'
              required
            >
              <option value="">Seleccione</option>
            </select>
          </div>

          <div className='flex gap-6 items-center'>
            <label htmlFor="num_cuadrilla" className='w-56'>Direccion:</label>
            <textarea
              type="text"
              id="direccion"
              name="direccion"
              className="bg-[#b2b1b1] rounded-2xl w-64 resize-none focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-6 items-start">

            <label className='w-56'>Subir imagenes/videos</label>
            <div>
              <MultiFileUpload />
            </div>
          </div>

        </div>

        <div className=''>
          <p className='ml-6 text-[20px]'>Seleccione la ubicacion del problema</p>
          <MyMap onSelect={handleMapSelect} selectedPosition={coords} currentLocation={currentLocation} />
          <p className='ml-6'>Ubicación actual: {currentLocation ? `Lat: ${currentLocation[0]}, Lng: ${currentLocation[1]}` : 'Obteniendo...'} (marcador azul)</p>
          <p className='ml-6'>Ubicación seleccionada: {coords ? `Lat: ${coords[0]}, Lng: ${coords[1]}` : 'Ninguna'} (marcador rojo)</p>
        </div>

        <div className='flex mb-6'>
          <button
            type="submit"
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
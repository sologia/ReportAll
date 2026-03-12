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
  const [problems, setProblems] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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

    const loadSectors = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${base}/api/sectors`);
        if (!response.ok) throw new Error('No se pudieron cargar los sectores');
        const data = await response.json();
        setSectors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando sectores:', error);
      }
    };

    const loadProblems = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${base}/api/problems`);
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody?.detail || errorBody?.message || 'No se pudieron cargar los problemas');
        }
        const data = await response.json();
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando problemas:', error?.message || error);
      }
    };

    loadSectors();
    loadProblems();
  }, []);

  const handleMapSelect = ([lat, lng]) => {
    setCoords([lat, lng]);
  };

  const ReportSubmit = async (e) => {
    e.preventDefault();

    if (!coords || coords.length !== 2) {
      setSubmitMessage('Debes seleccionar una ubicación válida en el mapa.');
      return;
    }

    if (!selectedSector) {
      setSubmitMessage('Debes seleccionar un sector.');
      return;
    }

    if (!address.trim()) {
      setSubmitMessage('Debes escribir la dirección.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage('Enviando reporte...');

      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const geometryWKT = `POINT(${coords[1]} ${coords[0]})`;
      const formData = new FormData();

      formData.append('Name_Problem', tipoReporte);
      formData.append('Urgency', 'Media');
      formData.append('GeoM', geometryWKT);
      formData.append('Adress', address);
      formData.append('Name_Sector', selectedSector);
      formData.append('Date_Time', new Date().toISOString());
      formData.append('ClientID', '1');

      if (selectedFiles.length > 0 && selectedFiles[0]?.file) {
        formData.append('BINPhoto', selectedFiles[0].file);
      }

      const response = await fetch(`${base}/api/reports`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      setSubmitMessage('Reporte enviado correctamente.');
    } catch (error) {
      console.error('Error enviando reporte:', error);
      setSubmitMessage('No se pudo enviar el reporte. Verifica los datos e intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
              required
            >
              <option value="">Seleccione</option>
              {problems.map((problem, idx) => (
                <option key={problem.Problem_ID || idx} value={problem.Name_Problem}>
                  {problem.Name_Problem}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-6 items-center">
            <label htmlFor='opciones_sectores' className='w-56'>Sector</label>
            <select
              name="opciones_sectores"
              id="opciones_sectores"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className='bg-[#b2b1b1] rounded-2xl w-64'
              required
            >
              <option value="">Seleccione</option>
              {sectors.map((sector, idx) => (
                <option key={sector.Name_Sector || idx} value={sector.Name_Sector}>
                  {sector.Name_Sector}
                </option>
              ))}
            </select>
          </div>

          <div className='flex gap-6 items-center'>
            <label htmlFor="num_cuadrilla" className='w-56'>Direccion:</label>
            <textarea
              type="text"
              id="direccion"
              name="direccion"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-[#b2b1b1] rounded-2xl w-64 resize-none focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-6 items-start">

            <label className='w-56'>Subir imagenes/videos</label>
            <div>
              <MultiFileUpload onFilesSelect={setSelectedFiles} />
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
            disabled={isSubmitting}
            className="w-70 ml-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {isSubmitting ? 'Enviando...' : 'Aceptar'}
          </button>
        </div>
        {submitMessage && <p className='ml-8 text-sm'>{submitMessage}</p>}
      </form>

    </div>
  )
}

export default CreateReportClient
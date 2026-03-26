'use client'
import ButtonBack from '@/app/components/ButtonBack'
import MultiFileUpload from '@/app/components/MultiFileUpload';
import SimpleTable from '@/app/components/SimpleTable';
import dynamic from 'next/dynamic';
const MyMap = dynamic(() => import('@/app/components/MyMap'), { ssr: false });
import { useForm } from '@/hooks/useForm';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Swal from 'sweetalert2';


const ReportFields = {
  tipoReporte: '',
}

const CreateReportClient = () => {
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_API_URL || '';

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
  const [datest, setDate] = useState('');
  const [clientId, setClientId] = useState(null);
  const [clientReports, setClientReports] = useState([]);

  const clientReportsColumns = [
    { header: 'ID Reporte', field: 'Report_ID' },
    { header: 'Problema', field: 'Name_Problem' },
    { header: 'Urgencia', field: 'Urgency' },
    { header: 'Dirección', field: 'Adress' },
    { header: 'Distrito', field: 'District' },
    { header: 'Estado', field: 'State' },
    { header: 'Fecha', field: 'Report_Date' },
  ];

  const loadClientReports = (currentClientId) => {
    if (!currentClientId) return;
    fetch(`${base}/api/reports/client/${currentClientId}`)
      .then(res => res.json())
      .then(data => setClientReports(Array.isArray(data) ? data : []))
      .catch(async (err) => {
        console.error('Error cargando reportes del cliente:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error de carga',
          text: 'No se pudieron cargar los reportes del cliente.',
          confirmButtonText: 'Entendido',
        });
      });
  }

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/auth/login');
      return;
    }

    if (session.role !== 'cliente') {
      router.replace('/dashboard/enacal');
      return;
    }

    setClientId(session.clientId);
    loadClientReports(session.clientId);

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

    Promise.all([
      fetch(`${base}/api/sectors`),
      fetch(`${base}/api/problems`),
    ])
      .then(async ([sectorsRes, problemsRes]) => {
        if (!sectorsRes.ok) throw new Error('No se pudieron cargar los sectores');
        if (!problemsRes.ok) {
          const errorBody = await problemsRes.json().catch(() => ({}));
          throw new Error(errorBody?.detail || errorBody?.message || 'No se pudieron cargar los problemas');
        }

        const [sectorsData, problemsData] = await Promise.all([
          sectorsRes.json(),
          problemsRes.json(),
        ]);

        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
        setProblems(Array.isArray(problemsData) ? problemsData : []);
      })
      .catch((error) => {
        console.error('Error cargando catálogos de reporte:', error?.message || error);
        Swal.fire({
          icon: 'error',
          title: 'Error de catálogos',
          text: error?.message || 'No se pudieron cargar los catálogos de reporte.',
          confirmButtonText: 'Entendido',
        });
      });
  }, []);

  const handleMapSelect = ([lat, lng]) => {
    setCoords([lat, lng]);
  };

  const ReportSubmit = async (e) => {
    e.preventDefault();

    if (!tipoReporte) {
      setSubmitMessage('Debes seleccionar un tipo de problema.');
      await Swal.fire({
        icon: 'warning',
        title: 'Problema requerido',
        text: 'Debes seleccionar un tipo de problema.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!datest) {
      setSubmitMessage('Debes seleccionar una fecha.');
      await Swal.fire({
        icon: 'warning',
        title: 'Fecha requerida',
        text: 'Debes seleccionar una fecha.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!coords || coords.length !== 2) {
      setSubmitMessage('Debes seleccionar una ubicación válida en el mapa.');
      await Swal.fire({
        icon: 'warning',
        title: 'Ubicación requerida',
        text: 'Debes seleccionar una ubicación válida en el mapa.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!selectedSector) {
      setSubmitMessage('Debes seleccionar un sector.');
      await Swal.fire({
        icon: 'warning',
        title: 'Sector requerido',
        text: 'Debes seleccionar un sector.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!address.trim()) {
      setSubmitMessage('Debes escribir la dirección.');
      await Swal.fire({
        icon: 'warning',
        title: 'Dirección requerida',
        text: 'Debes escribir la dirección.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage('Enviando reporte...');

      const formData = new FormData();

      formData.append('Name_Problem', tipoReporte);
      formData.append('Urgency', 'Media');
      formData.append('X', coords[1]);
      formData.append('Y', coords[0]);
      formData.append('Adress', address);
      formData.append('Name_Sector', selectedSector);
      formData.append('Date_Time', datest);
      formData.append('ClientID', String(clientId || ''));

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
      await Swal.fire({
        icon: 'success',
        title: 'Reporte enviado',
        text: 'El reporte se creó correctamente.',
        confirmButtonText: 'Aceptar',
      });
      loadClientReports(clientId);
    } catch (error) {
      console.error('Error enviando reporte:', error);
      setSubmitMessage('No se pudo enviar el reporte. Verifica los datos e intenta de nuevo.');
      await Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: error?.message || 'No se pudo enviar el reporte. Verifica los datos e intenta de nuevo.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clientId) {
    return <p className='ml-8 mt-8'>Cargando perfil de cliente...</p>;
  }


  return (
    <div>

      <div>
        <ButtonBack />
      </div>

      <form onSubmit={ReportSubmit} className="flex flex-col gap-6" noValidate>

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
          <div className='flex gap-6 items-center'>
            <label htmlFor="fecha" className='w-56'>Fecha:</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={datest}
              onChange={(e) => setDate(e.target.value)}
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

      <div className='mt-10'>
        <h3 className='text-xl font-semibold ml-6'>Reportes ya creados</h3>
        <SimpleTable columns={clientReportsColumns} data={clientReports} />
      </div>

    </div>
  )
}

export default CreateReportClient
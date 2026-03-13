'use client'
import ButtonGroup from '@/app/components/ButtonGroup '
import SimpleTable from '@/app/components/SimpleTable'
import { useState, useEffect } from 'react';



const ViewReports = () => {

  const [data, setData] = useState([]);
  const [states, setStates] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [filters, setFilters] = useState({
    district: '',
    sector: '',
    date: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_URL || '';

  const columns = [
    { header: "ID", field: "Report_ID" },
    { header: "Problema", field: "Name_Problem" },
    { header: "Urgencia", field: "Urgency" },
    { header: "Dirección", field: "Adress" },
    { header: "Distrito", field: "District" },
    { header: "Estado", field: "State" },
    { header: "Fecha", field: "Report_Date" },
  ];

  const loadReports = async (activeFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeFilters.district) params.append('district', activeFilters.district);
      if (activeFilters.sector) params.append('sector', activeFilters.sector);
      if (activeFilters.date) params.append('date', activeFilters.date);
      if (activeFilters.state) params.append('state', activeFilters.state);

      const query = params.toString();
      const response = await fetch(`${base}/api/reports/summary${query ? `?${query}` : ''}`);
      const raw = await response.json();
      setData(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('failed loading reports', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();

    Promise.all([
      fetch(`${base}/api/states`),
      fetch(`${base}/api/sectors`),
    ])
      .then(async ([statesRes, sectorsRes]) => {
        const [statesData, sectorsData] = await Promise.all([
          statesRes.json(),
          sectorsRes.json(),
        ]);

        setStates(Array.isArray(statesData) ? statesData : []);
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
      })
      .catch(err => console.error('failed loading filter options', err));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  const handleFilter = (event) => {
    event.preventDefault();
    loadReports(filters);
  }

  const clearFilters = () => {
    const reset = { district: '', sector: '', date: '', state: '' };
    setFilters(reset);
    loadReports(reset);
  }

  return (
    <>

      <div>
          <ButtonGroup
          buttons={[
            { label: "Resumen IT", href: "/dashboard/enacal/reports/summary" },
            { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
            { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
            { label: "Menu", href: "/dashboard/enacal" },
          ]}
          />
      </div>
      
      <form onSubmit={handleFilter} className='flex flex-wrap gap-4 items-end mb-4'>
        <div className='flex flex-col'>
          <label htmlFor='district'>Distrito</label>
          <select
            id='district'
            name='district'
            value={filters.district}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          >
            <option value=''>Todos</option>
            {sectors.map((item, idx) => (
              <option key={`${item.Name_Sector}-${idx}`} value={item.Name_Sector}>{item.Name_Sector}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-col'>
          <label htmlFor='sector'>Sector</label>
          <select
            id='sector'
            name='sector'
            value={filters.sector}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          >
            <option value=''>Todos</option>
            {sectors.map((item, idx) => (
              <option key={`${item.Name_Sector}-sector-${idx}`} value={item.Name_Sector}>{item.Name_Sector}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-col'>
          <label htmlFor='date'>Fecha</label>
          <input
            id='date'
            name='date'
            type='date'
            value={filters.date}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          />
        </div>

        <div className='flex flex-col'>
          <label htmlFor='state'>Estado de reporte</label>
          <select
            id='state'
            name='state'
            value={filters.state}
            onChange={handleChange}
            className='bg-[#b2b1b1] rounded-2xl px-3 py-2'
          >
            <option value=''>Todos</option>
            {states.map((item, idx) => (
              <option key={`${item.StateAs}-${idx}`} value={item.StateAs}>{item.StateAs}</option>
            ))}
          </select>
        </div>

        <button type='submit' className='bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition'>
          Filtrar
        </button>

        <button type='button' onClick={clearFilters} className='bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition'>
          Limpiar
        </button>
      </form>

      <div>
        {loading ? <p>Cargando reportes...</p> : <SimpleTable columns={ columns } data={data}/>}
      </div>

      

    </>
  )
}

export default ViewReports
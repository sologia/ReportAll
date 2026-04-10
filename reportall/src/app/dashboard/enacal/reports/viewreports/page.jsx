'use client'
import ButtonGroup from '@/app/components/ButtonGroup '
import SimpleTable from '@/app/components/SimpleTable'
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { buildSessionHeaders, getSession } from '@/lib/auth';
import { canViewIds, normalizeRole } from '@/lib/rbac';



const ViewReports = () => {
  const session = getSession();
  const role = normalizeRole(session?.role);
  const isAdmin = canViewIds(role);

  const [data, setData] = useState([]);
  const [states, setStates] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [urgencies, setUrgencies] = useState([]);
  const [draftUrgencies, setDraftUrgencies] = useState({});
  const [savingReportId, setSavingReportId] = useState(null);
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
      const response = await fetch(`${base}/api/reports/summary${query ? `?${query}` : ''}`, {
        headers: buildSessionHeaders(session),
        credentials: 'include',
      });
      const raw = await response.json();
      const rows = Array.isArray(raw) ? raw : [];
      setData(rows);
      setDraftUrgencies(rows.reduce((accumulator, row) => {
        accumulator[row.Report_ID] = row.Urgency || '';
        return accumulator;
      }, {}));
    } catch (err) {
      console.error('failed loading reports', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();

    const requests = [
      fetch(`${base}/api/states`, { headers: buildSessionHeaders(session), credentials: 'include' }),
      fetch(`${base}/api/sectors`, { headers: buildSessionHeaders(session), credentials: 'include' }),
    ];

    if (isAdmin) {
      requests.push(fetch(`${base}/api/reports/urgencies`, { headers: buildSessionHeaders(session), credentials: 'include' }));
    }

    Promise.all(requests)
      .then(async (responses) => {
        const [statesRes, sectorsRes, urgenciesRes] = responses;
        const payloads = [
          statesRes.json(),
          sectorsRes.json(),
        ];

        if (urgenciesRes) {
          payloads.push(urgenciesRes.json());
        }

        const [statesData, sectorsData, urgenciesData = []] = await Promise.all(payloads);

        setStates(Array.isArray(statesData) ? statesData : []);
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
        setUrgencies(Array.isArray(urgenciesData) ? urgenciesData : []);
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

  const getUrgencyClasses = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized.includes('alta')) return 'bg-red-100 text-red-700';
    if (normalized.includes('media')) return 'bg-yellow-100 text-yellow-800';
    if (normalized.includes('baja')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleUrgencyChange = (reportId, value) => {
    setDraftUrgencies((previous) => ({ ...previous, [reportId]: value }));
  };

  const saveUrgency = async (reportId) => {
    const urgency = draftUrgencies[reportId];
    if (!urgency) {
      await Swal.fire({
        icon: 'warning',
        title: 'Urgencia requerida',
        text: 'Selecciona una urgencia antes de guardar.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    try {
      setSavingReportId(reportId);
      const response = await fetch(`${base}/api/reports/${reportId}/urgency`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...buildSessionHeaders(session),
        },
        body: JSON.stringify({ Urgency: urgency }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.message || 'No se pudo actualizar la urgencia');
      }

      setData((previous) => previous.map((row) => (
        row.Report_ID === reportId ? { ...row, Urgency: body?.Urgency || urgency } : row
      )));

      await Swal.fire({
        icon: 'success',
        title: 'Urgencia actualizada',
        text: 'La urgencia del reporte se guardó correctamente.',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error?.message || 'No se pudo actualizar la urgencia',
        confirmButtonText: 'Entendido',
      });
    } finally {
      setSavingReportId(null);
    }
  };

  return (
    <>

      <div>
          <ButtonGroup
          buttons={[
            { label: "Estadísticas", href: "/dashboard/enacal/reports/statistics" },
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
        {loading ? <p>Cargando reportes...</p> : isAdmin ? (
          <div className="overflow-x-auto rounded-lg shadow-md mt-6 bg-white">
            <table className="min-w-full border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} className="py-3 px-4 text-left text-sm font-medium">{col.header}</th>
                  ))}
                  <th className="py-3 px-4 text-left text-sm font-medium">Editar urgencia</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4 text-gray-500">No hay datos</td>
                  </tr>
                ) : data.map((row) => (
                  <tr key={row.Report_ID} className="border-b hover:bg-blue-50 transition">
                    {columns.map((col, index) => (
                      <td key={index} className="py-3 px-4 text-sm text-gray-700">
                        {col.field === 'Urgency' ? (
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getUrgencyClasses(row[col.field])}`}>
                            {row[col.field] || 'Sin urgencia'}
                          </span>
                        ) : row[col.field]}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <select
                          value={draftUrgencies[row.Report_ID] || ''}
                          onChange={(event) => handleUrgencyChange(row.Report_ID, event.target.value)}
                          className="rounded-md border px-2 py-1"
                        >
                          <option value="">Seleccione</option>
                          {urgencies.map((item) => (
                            <option key={item.ProblemLevel_ID || item.Urgency} value={item.Urgency}>{item.Urgency}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => saveUrgency(row.Report_ID)}
                          disabled={savingReportId === row.Report_ID}
                          className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                          {savingReportId === row.Report_ID ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <SimpleTable columns={ columns } data={data}/>}
      </div>

      

    </>
  )
}

export default ViewReports
'use client'
import ButtonGroup from '@/app/components/ButtonGroup '
import SimpleTable from '@/app/components/SimpleTable'
import StateBadge from '@/app/components/StateBadge'
import TablePaginationControls from '@/app/components/TablePaginationControls'
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { buildSessionHeaders, getSession } from '@/lib/auth';
import { canViewIds, normalizeRole } from '@/lib/rbac';
import { useTablePagination } from '@/hooks/useTablePagination';



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
    date: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  const {
    paginatedRows,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    handlePageSizeChange,
    setCurrentPage,
  } = useTablePagination(data);

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
    const reset = { district: '', date: '', state: '' };
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

      <section className='rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] mb-5'>
        <h2 className='text-2xl sm:text-3xl font-bold text-slate-900'>Gestion de reportes</h2>
        <p className='mt-1 text-slate-600'>Filtra reportes y, si tienes permisos, actualiza su nivel de urgencia.</p>
      </section>

      <div className='mb-4'>
          <ButtonGroup
          buttons={[
            { label: "Estadísticas", href: "/dashboard/enacal/reports/statistics" },
            { label: "Resumen IT", href: "/dashboard/enacal/reports/summary" },
            { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
            { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
            { label: "Volver al menu principal", href: "/dashboard/enacal" },
          ]}
          />
      </div>
      
      <form onSubmit={handleFilter} className='rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end mb-4'>
        <div className='flex flex-col gap-1'>
          <label htmlFor='district' className='field-label'>Sector</label>
          <select
            id='district'
            name='district'
            value={filters.district}
            onChange={handleChange}
            className='field-control'
          >
            <option value=''>Todos</option>
            {sectors.map((item, idx) => (
              <option key={`${item.Name_Sector}-${idx}`} value={item.Name_Sector}>{item.Name_Sector}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='date' className='field-label'>Fecha</label>
          <input
            id='date'
            name='date'
            type='date'
            value={filters.date}
            onChange={handleChange}
            className='field-control'
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='state' className='field-label'>Estado de reporte</label>
          <select
            id='state'
            name='state'
            value={filters.state}
            onChange={handleChange}
            className='field-control'
          >
            <option value=''>Todos</option>
            {states.map((item, idx) => (
              <option key={`${item.StateAs}-${idx}`} value={item.StateAs}>{item.StateAs}</option>
            ))}
          </select>
        </div>

        <div className='flex gap-2'>
          <button type='submit' className='btn-primary flex-1'>
            Filtrar
          </button>

          <button type='button' onClick={clearFilters} className='btn-secondary flex-1'>
            Limpiar
          </button>
        </div>
      </form>

      <div>
        {loading ? <p>Cargando reportes...</p> : isAdmin ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-[0_8px_20px_rgba(15,23,42,0.06)] mt-6 bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} className="py-3 px-4 text-left text-xs sm:text-sm font-semibold">{col.header}</th>
                  ))}
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold">Editar urgencia</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-8 text-slate-500">No hay datos</td>
                  </tr>
                ) : paginatedRows.map((row) => (
                  <tr key={row.Report_ID} className="border-b border-slate-100 hover:bg-sky-50/70 transition">
                    {columns.map((col, index) => (
                      <td key={index} className="py-3 px-4 text-slate-700">
                        {col.field === 'Urgency' ? (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${getUrgencyClasses(row[col.field])}`}>
                            {row[col.field] || 'Sin urgencia'}
                          </span>
                        ) : col.field === 'State' ? (
                          <StateBadge value={row[col.field]} />
                        ) : row[col.field]}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <select
                          value={draftUrgencies[row.Report_ID] || ''}
                          onChange={(event) => handleUrgencyChange(row.Report_ID, event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5"
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
                          className="btn-primary py-1.5 px-3 disabled:bg-slate-400"
                        >
                          {savingReportId === row.Report_ID ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePaginationControls
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : <SimpleTable columns={ columns } data={data}/>}
      </div>

      

    </>
  )
}

export default ViewReports
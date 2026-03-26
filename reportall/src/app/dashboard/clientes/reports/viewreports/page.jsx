'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ButtonBack from '@/app/components/ButtonBack'
import SimpleTable from '@/app/components/SimpleTable'
import { getSession } from '@/lib/auth'
import Swal from 'sweetalert2'

const ViewReportClient = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { header: 'ID Reporte', field: 'Report_ID' },
    { header: 'Problema', field: 'Name_Problem' },
    { header: 'Urgencia', field: 'Urgency' },
    { header: 'Dirección', field: 'Adress' },
    { header: 'Distrito', field: 'District' },
    { header: 'Estado', field: 'State' },
    { header: 'Fecha', field: 'Report_Date' },
  ];

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

    if (!session.clientId) {
      Swal.fire({
        icon: 'warning',
        title: 'Perfil incompleto',
        text: 'No se encontró el identificador de cliente para cargar tus reportes.',
        confirmButtonText: 'Aceptar',
      });
      setLoading(false);
      setData([]);
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/reports/client/${session.clientId}`)
      .then((res) => res.json())
      .then((result) => setData(Array.isArray(result) ? result : []))
      .catch((err) => {
        console.error('Error cargando reportes del cliente', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de carga',
          text: 'No se pudieron cargar tus reportes.',
          confirmButtonText: 'Entendido',
        });
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className='rounded-2xl'>
      <ButtonBack />

      <div className='mt-4'>
        <h2 className='text-2xl font-semibold'>Mis reportes y estados</h2>
        {loading ? <p className='mt-4'>Cargando reportes...</p> : <SimpleTable columns={columns} data={data} />}
      </div>
    </div>
  )
}

export default ViewReportClient
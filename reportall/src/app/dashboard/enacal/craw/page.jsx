'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SimpleTable from '@/app/components/SimpleTable'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import React, { useState, useEffect } from 'react'
import ButtonBack from '@/app/components/ButtonBack'

const CrawPage = () => {

  const [data, setData] = useState([]);

  const columns = [
    { header: "NumCuadrilla", field: "Num_Crew" },
    { header: "Nombre Sector", field: "Name_Sector" },
    { header: "Estado", field: "Availability_Crew" },
    { header: "Placa", field: "Plate" },
  ];

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(raw => {
        setData(raw);
      })
      .catch(err => console.error('failed loading crews', err));
  }, []);

  return (
    <section aria-label="Gestión de cuadrillas" className="w-full px-2 sm:px-4 pb-6">
      <ButtonBack />

      {/* <PageHeaderCard
        title="Cuadrillas"
        description="Consulta, crea o modifica cuadrillas y revisa su estado actual."
      /> */}

      <ButtonGroup
        buttons={[
          { label: "Crear", href: "/dashboard/enacal/craw/createcraw" },
          { label: "Modificar", href: "/dashboard/enacal/craw/updatecraw" },
          { label: "Accesos cuadrillas", href: "/dashboard/enacal/craw/accounts" },
          { label: "Matrículas", href: "/dashboard/enacal/vehicles" },
        ]}
      />

      <div>
        <SimpleTable columns={columns} data={data} />
      </div>

    </section>
  )
}
export default CrawPage
'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SimpleTable from '@/app/components/SimpleTable'
import PageHeaderCard from '@/app/components/PageHeaderCard'
import React, { useState, useEffect } from 'react'
import ButtonBack from '@/app/components/ButtonBack'

const AssignmentsPage = () => {

  const [data, setData] = useState([]);

  const columns = [
    { header: "Nombre del Lider", field: "Name_Leader" },
    { header: "Numero Cuadrilla", field: "Num_Crew" },
    { header: "Reporte", field: "Report_ID" },
    { header: "Direccion", field: "Report_Adress" },
    { header: "Fecha", field: "Dates" },
    { header: "Estado", field: "StateAs" },
  ];

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/assignments`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('failed loading assignments', err));
  }, []);

  return (
    <section aria-label="Gestión de asignaciones" className="w-full px-2 sm:px-4 pb-6">
      <ButtonBack />

      {/* <PageHeaderCard
        title="Asignaciones"
        description="Gestiona las asignaciones de reportes para cada cuadrilla."
      /> */}

      {/* <ButtonGroup
        buttons={[
          { label: "Reportes", href: "/dashboard/enacal/reports/viewreports" },
          { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
          { label: "Menu", href: "/dashboard/enacal" },
        ]}
      /> */}
      {/* Tengo problemas con la page y que se muestren los botone */}
      <ButtonGroup
        buttons={[
          { label: "Crear Asignacion", href: "/dashboard/enacal/assignments/createassignments" },
          { label: "Modificar Asignacion", href: "/dashboard/enacal/assignments/updateassignments" },
          // { label: "Menu", href: "/dashboard/enacal" },

        ]}
      />

      <div>
        <SimpleTable columns={columns} data={data} />
      </div>

    </section>
  )
}
export default AssignmentsPage
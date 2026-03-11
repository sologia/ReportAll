'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useState, useEffect } from 'react'

const AssignmentsPage = () => {

  const [data, setData] = useState([]);
  
    const columns = [
      { header: "Nombre del Lider", field: "Name_Leader" },
      { header: "Numero Cuadrilla", field: "Num_Crew" },
      { header: "Nombre Ruta", field: "Name_Path" },
      { header: "Fecha", field: "Dates" },
      { header: "Estado", field: "StateAs" },
    ];

    // load assignments (placeholder) to avoid confusion in UI
    useEffect(() => {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${base}/api/assignments`)
        .then(res => res.json())
        .then(data => setData(data))
        .catch(err => console.error('failed loading assignments', err));
    }, []);
  
  return (
    <form>

        <ButtonGroup
            buttons={[
              { label: "Reportes", href: "/dashboard/enacal/reports/viewreports" },
              { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
              { label: "Menu", href: "/dashboard/enacal" },
            ]}
        />

        <SearchBar/>

        <ButtonGroup
            buttons={[
              { label: "Crear", href: "/dashboard/enacal/assignments/createassignments" },
              { label: "Modificar", href: "/dashboard/enacal/assignments/updateassignments" },
              { label: "Eliminar", href: "/dashboard/enacal/assignments/deleteassignments" },
            ]}
        />

        <div>
          <SimpleTable columns={ columns } data={ data }/>
        </div>

        

    </form>
  )
}

export default AssignmentsPage
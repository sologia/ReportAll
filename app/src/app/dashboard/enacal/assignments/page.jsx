'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useState } from 'react'

const AssignmentsPage = () => {

  const [data, setData] = useState([]);
  
    const columns = [
      { header: "ID", field: "id" },
      { header: "Nombre", field: "nombre" },
      { header: "Estado", field: "estado" },
      { header: "Fecha", field: "fecha" },
    ];
  
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
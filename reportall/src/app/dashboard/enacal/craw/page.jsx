'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useState } from 'react'

const CrawPage = () => {

  const [data, setData] = useState([]);
  
    const columns = [
      { header: "ID", field: "id" },
      { header: "Nombre", field: "nombre" },
      { header: "Estado", field: "estado" },
      { header: "Fecha", field: "fecha" },
    ];
  
  return (
    <div>

        <ButtonGroup
            buttons={[
              { label: "Reportes", href: "/dashboard/enacal/reports/viewreports" },
              { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
              { label: "Menu", href: "/dashboard/enacal" },
            ]}
        />

        <SearchBar/>

        <ButtonGroup
            buttons={[
              { label: "Crear", href: "/dashboard/enacal/craw/createcraw" },
              { label: "Modificar", href: "/dashboard/enacal/craw/updatecraw" },
              { label: "Eliminar", href: "/dashboard/enacal/deletecraw" },
            ]}
        />

        <div>
          <SimpleTable columns={ columns } data={ data }/>
        </div>
        

        

    </div>
  )
}

export default CrawPage
'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useState, useEffect } from 'react'

const CrawPage = () => {

  const [data, setData] = useState([]);
  
    const columns = [
      { header: "NumCuadrilla", field: "Num_Crew" },
      { header: "Nombre Sector", field: "Name_Sector" },
      // adjust the following to match whatever fields your API returns
      { header: "Estado", field: "Availability_Crew" },
      { header: "Placa", field: "Plate" },
    ];

  // fetch list of crews from backend when page loads
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/crews`)
      .then(res => res.json())
      .then(raw => {
        // optionally rename fields or transform data here if needed
        // for now we assume the backend returns the same names as the proc
        setData(raw);
      })
      .catch(err => console.error('failed loading crews', err));
  }, []);

  return (
    <div>

        <ButtonGroup
            buttons={[
              { label: "Resumen IT", href: "/dashboard/enacal/craw/report-summary" },
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
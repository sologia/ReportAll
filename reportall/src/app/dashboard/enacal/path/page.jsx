'use client'

import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import React, { useState, useEffect } from 'react'

const PathPage = () => {

  const [data, setData] = useState([]);
  
    const columns = [
      { header: "Path", field: "Name_Path" },
      { header: "Creacion fecha de path", field: "Date_time" },
    ];

  // fetch list of paths from backend when page loads
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/paths`)
      .then(res => res.json())
      .then(raw => {
        // si el backend devuelve un arreglo válido, lo mostramos en tabla
        setData(raw);
      })
      .catch(err => console.error('failed loading paths', err));
  }, []);

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
              { label: "Crear", href: "/dashboard/enacal/path/createpath" },
            //   { label: "Modificar", href: "/dashboard/enacal/path/updatepath" },
            //   { label: "Eliminar", href: "/dashboard/enacal/path/deletepath" },
            ]}
        />

        <div>
          <SimpleTable columns={ columns } data={ data }/>
        </div>
        

        

    </div>
  )
}

export default PathPage
'use client'
import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import { useState, useEffect } from 'react';



const ViewReports = () => {

  const [data, setData] = useState([]);

  // column list corresponds exactly to the sp_SelectReport select clause
  const columns = [
    { header: "Problema", field: "Name_Problem" },
    { header: "Urgencia", field: "Urgency" },
    { header: "Dirección", field: "Adress" },
    { header: "Sector", field: "Name_Sector" },
    { header: "Fecha", field: "Date_time" },
  ];

  // fetch data from backend; rewrites make `/api/...` point to the Express server
  // you can also set NEXT_PUBLIC_API_URL to something like http://localhost:3001
  // if you prefer an absolute address.
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/reports`)
      .then((res) => res.json())
      .then(raw => {
        // optionally rename fields or transform data here if needed
        // for now we assume the backend returns the same names as the proc
        setData(raw);
      })
      .catch(err => console.error('failed loading crews', err));
  }, []);


  return (
    <>

      <div>
          <ButtonGroup
          buttons={[
            { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
            { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
            { label: "Menu", href: "/dashboard/enacal" },
          ]}
          />
      </div>
      
      <div>
          <SearchBar/>
      </div>

      <div>
        {/* <h2 className="text-2xl font-bold mt-4">Listado de Reportes</h2> */}
        <SimpleTable columns={ columns } data={data}/>
      </div>

      

    </>
  )
}

export default ViewReports
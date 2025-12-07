'use client'
import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import SimpleTable from '@/app/components/SimpleTable'
import { useState } from 'react';



const ViewReports = () => {

  const [data, setData] = useState([]);

  const columns = [
    { header: "ID", field: "id" },
    { header: "Nombre", field: "Name_Problem" },
    { header: "Estado", field: "Urgency" },
    { header: "Ubicacion", field: "GeoM" },   //geometry
    { header: "Foto", field: "BINPhoto" },  
    { header: "Direccion", field: "Adress" },
    { header: "Sector", field: "Name_Sector" },
    { header: "Fecha", field: "Date_Time" },
  ];

  // useEffect(() => {
  //   fetch("http://localhost:3000/api/reportes")
  //     .then((res) => res.json())
  //     .then((data) => setData(data))
  //     .catch((err) => console.error(err));
  // }, []);


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
        <SimpleTable columns={ columns } data={ data }/>
      </div>

      

    </>
  )
}

export default ViewReports
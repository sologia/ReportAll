import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import React from 'react'

const CrawPage = () => {
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

        

    </div>
  )
}

export default CrawPage
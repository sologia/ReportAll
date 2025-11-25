import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'
import React from 'react'

const AssignmentsPage = () => {
  return (
    <div>

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

        

    </div>
  )
}

export default AssignmentsPage
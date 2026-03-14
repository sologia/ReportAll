import ButtonGroup from '@/app/components/ButtonGroup '
import React from 'react'

const TowExample = () => {
  return (
    <>
      <ButtonGroup
        containerClass="flex flex-col items-center justify-center mt-12 gap-12"
        buttonClass="w-80 m-auto mt-3"
        buttons={[
          { label: "Reportes", href: "/dashboard/enacal/reports/viewreports" },
          { label: "Resumen IT", href: "/dashboard/enacal/reports/summary" },
          { label: "Estadísticas", href: "/dashboard/enacal/reports/statistics" },
          { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
          { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
        ]}
      />
    </>
  )
}
export default TowExample

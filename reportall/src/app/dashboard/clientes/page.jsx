'use client'

import ButtonGroup from "@/app/components/ButtonGroup ";

function simplexample() {
  return (
    <div>
      <ButtonGroup
        containerClass="flex items-center justify-center mt-12 gap-12"
        buttonClass="w-80 m-auto mt-3"
        buttons={[
          { label: "Buscar", href: "/dashboard/clientes/reports/viewreports" },
          { label: "Crear reporte", href: "/dashboard/clientes/reports/createreports" },
        ]}
      />

    </div>
  )
}

export default simplexample;

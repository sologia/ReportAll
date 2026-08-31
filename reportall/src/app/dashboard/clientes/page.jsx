'use client'

import ButtonGroup from "@/app/components/ButtonGroup ";
import PageHeaderCard from '@/app/components/PageHeaderCard'

function simplexample() {
  return (
    <div className='space-y-6'>
      <PageHeaderCard
        title='Panel de Cliente'
        description='Busca el estado de tus reportes o registra uno nuevo en pocos pasos.'
      />

      <ButtonGroup
        containerClass="md:grid-cols-2"
        buttonClass="min-h-16"
        buttons={[
          { label: "Ver mis reportes", href: "/dashboard/clientes/reports/viewreports" },
          { label: "Crear un reporte nuevo", href: "/dashboard/clientes/reports/createreports" },
        ]}
      />

    </div>
  )
}

export default simplexample;

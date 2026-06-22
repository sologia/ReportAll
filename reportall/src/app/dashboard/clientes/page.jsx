'use client'

import ButtonGroup from "@/app/components/ButtonGroup ";

function simplexample() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'>
        <h2 className='text-2xl sm:text-3xl font-bold text-slate-900'>Panel de cliente</h2>
        <p className='mt-2 text-slate-600'>Busca el estado de tus reportes o registra uno nuevo en pocos pasos.</p>
      </section>

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

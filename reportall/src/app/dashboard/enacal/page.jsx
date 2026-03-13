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
          { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
          { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
          // { label: "Path", href: "/dashboard/enacal/path" },
          { label: "Clientes", href: "/dashboard/clientes" },
        ]}
      />
    </>
    // <div className='flex flex-col items-center justify-center mt-12 gap-12'>

    //   <div>
    //     <button
    //         type="submit"
    //       //   value='Login'
    //         className="w-80 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
    //     >
    //         Reportes
    //     </button>
    //   </div>

    //   <div>
    //     <button
    //         type="submit"
    //       //   value='Login'
    //         className="w-80 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
    //     >
    //         Cuadrillas
    //     </button>
    //   </div>

    //   <div>
    //     <button
    //         type="submit"
    //       //   value='Login'
    //         className="w-80 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
    //     >
    //         Asignaciones
    //     </button>
    //   </div>
      
    // </div>
  )
}

export default TowExample

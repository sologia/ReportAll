"use client";
import { usePathname } from "next/navigation";

function DashboardLayout ({ children }) {

  const pathname = usePathname();

  // convertir ruta → nombre bonito
  const getLabel = () => {
    if (pathname.includes("/dashboard/enacal/reports/viewreports"))
      return "Reportes";

    if (pathname.includes("/dashboard/enacal/assignments"))
      return "Asignaciones";

    if (pathname.includes("/dashboard/enacal/craw"))
      return "Cuadrillas";
    if (pathname.includes("/dashboard/enacal/path"))
      return "Path";

    return "Menu Principal"; // default
  };


  const pathname2 = usePathname();

  const getStyle = () => {
    if(pathname2.includes("/dashboard/clientes"))
      return "";
    if(pathname2.includes("/dashboard/enacal"))
      return "items center"
  }
  
  return (
    <div className={`min-h-screen w-full flex justify-center bg-[#42B8EA] ${getStyle()}`}>
    {/* // <div className='min-h-screen w-full flex justify-center bg-[#42B8EA]'> No sirvio*/}
      {/* <div className='w-full h-screen max-w-4xl bg-white rounded-2xl shadow-xl '> */}
      {/* <div className='w-[1050px] h-screen bg-white shadow-[var(--sombra2)] flex flex-col'> */}
      <div className='w-[1050px] min-h-screen bg-white shadow-[var(--sombra2)] flex flex-col overflow-visible'>
      {/* <div className='w-[1050px] h-screen bg-white rounded-2xl shadow-xl '> */}

        <div className='border-[1.5] w-full h-[100px] flex justify-between items-center shadow-[var(--sombra1)] mb-4'>

          <div className='w-40 ml-9'>
            <img src="/img/logoEnacal.png"/>
          </div>

          <div className='mr-9'>
            btn de cerrar cesion

          </div>
          
        </div>

        {/* <div className='w-[1000px] m-auto bg-[var(--fondo1)] flex-1 min-h-0 overflow-y-auto rounded-md'> */}
        <div className='w-[1000px] m-auto bg-[var(--fondo1)] flex-1 min-h-0 rounded-md'>
          <div>

            <div className="bg-[var(--fondo3)] rounded-md h-[42px] flex items-center pl-8">
              {/* Me quede en editar esto */}
              <h3 className="text-[25px]">{getLabel()}</h3>   
            </div>

            <div>
              { children }
            </div>

          </div>
        </div>

      </div>
        
    </div>
  )
}

export default DashboardLayout;


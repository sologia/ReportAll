"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession } from '@/lib/auth';
import { getDefaultRouteByRole, isPathAllowedForRole, normalizeRole } from '@/lib/rbac';

function DashboardLayout({ children }) {

  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      router.replace('/auth/login');
      return;
    }

    const role = normalizeRole(currentSession.role);
    const isAllowed = isPathAllowedForRole(role, pathname);
    if (!isAllowed) {
      router.replace(getDefaultRouteByRole(role));
      return;
    }

    setSession(currentSession);
    setReady(true);
  }, [pathname, router]);

  const onLogout = () => {
    clearSession();
    router.replace('/auth/login');
  }

  // convertir ruta → nombre bonito
  const getLabel = () => {
    if (pathname.includes("/dashboard/enacal/reports/viewreports"))
      return "Reportes";

    if (pathname.includes("/dashboard/enacal/assignments"))
      return "Asignaciones";

    if (pathname.includes("/dashboard/enacal/craw"))
      return "Cuadrillas";
    if (pathname.includes("/dashboard/enacal/crew/reports"))
      return "Mis Reportes Asignados";
    if (pathname.includes("/dashboard/enacal/path"))
      return "Path";

    return "Menu Principal"; // default
  };

  const getStyle = () => {
    if (pathname.includes("/dashboard/clientes"))
      return "";
    if (pathname.includes("/dashboard/enacal"))
      return "items-center"
  }

  if (!ready) {
    return null;
  }

  return (
    <div className={`min-h-screen w-full flex justify-center bg-[#42B8EA] px-2 sm:px-4 ${getStyle()}`}>
      <div className='w-full max-w-[1050px] min-h-screen bg-white shadow-(--sombra2) flex flex-col overflow-visible'>

        <div className='border-[1.5] w-full min-h-[100px] flex flex-col sm:flex-row justify-between sm:items-center shadow-(--sombra1) mb-4 px-4 sm:px-0 py-3 sm:py-0 gap-3 sm:gap-0'>

          <div className='w-32 sm:w-40 sm:ml-9'>
            <img src="/img/logoEnacal.png" alt="Logo Enacal" className="w-full h-auto object-contain" />
          </div>

          <div className='w-full sm:w-auto sm:mr-9'>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="truncate">{session?.displayName || 'Usuario'}</span>
              <button
                type="button"
                onClick={onLogout}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto text-sm sm:text-base"
              >
                Cerrar sesión
              </button>
            </div>

          </div>

        </div>

        <div className='w-full max-w-[1000px] mx-auto bg-(--fondo1) flex-1 min-h-0 rounded-md'>
          <div>

            <div className="bg-(--fondo3) rounded-md min-h-[42px] flex items-center px-4 sm:pl-8 py-1">
              <h3 className="text-xl sm:text-2xl">{getLabel()}</h3>
            </div>

            <div>
              {children}
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
export default DashboardLayout;


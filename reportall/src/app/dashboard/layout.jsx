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
    <div className={`min-h-screen w-full flex justify-center app-shell px-2 sm:px-4 py-3 sm:py-5 ${getStyle()}`}>
      <div className='w-full max-w-[1140px] min-h-screen rounded-2xl glass-card flex flex-col overflow-hidden'>

        <header className='w-full min-h-24 flex flex-col md:flex-row justify-between md:items-center border-b border-slate-200 px-4 md:px-8 py-4 gap-4 bg-white/90'>
          <div className='flex items-center gap-4'>
            <div className='w-28 sm:w-36'>
              <img src="/img/logoENACAL.png" alt="Logo Enacal" className="w-full h-auto object-contain" />
            </div>
            <div>
              <h1 className='text-lg sm:text-xl font-bold text-slate-900'>ReportALL</h1>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Panel de gestion</p>
            </div>
          </div>

          <div className='w-full md:w-auto'>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <span className="truncate text-slate-700 font-medium">{session?.displayName || 'Usuario'}</span>
              <button
                type="button"
                onClick={onLogout}
                className="btn-primary w-full md:w-auto text-sm"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </header>

        <main className='w-full max-w-[1080px] mx-auto flex-1 min-h-0 p-3 sm:p-5'>
          <section className='bg-(--fondo1) rounded-xl border border-slate-200 overflow-hidden'>
            <div className="bg-(--fondo3) min-h-[52px] flex items-center px-4 sm:px-6 py-2 border-b border-slate-200">
              <h3 className="text-lg sm:text-2xl font-semibold text-slate-900">{getLabel()}</h3>
            </div>

            <div className='p-3 sm:p-4 md:p-5'>
              {children}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
export default DashboardLayout;


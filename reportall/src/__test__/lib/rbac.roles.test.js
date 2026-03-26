import { getDefaultRouteByRole } from '@/lib/rbac';

describe('getDefaultRouteByRole', () => {
  it('resuelve la ruta por defecto para los 5 roles de negocio', () => {
    expect(getDefaultRouteByRole('cliente')).toBe('/dashboard/clientes');
    expect(getDefaultRouteByRole('administrador')).toBe('/dashboard/enacal');
    expect(getDefaultRouteByRole('director_it')).toBe('/dashboard/enacal/reports/summary');
    expect(getDefaultRouteByRole('cuadrilla')).toBe('/dashboard/enacal/crew/reports');
    expect(getDefaultRouteByRole('lider_cuadrilla')).toBe('/dashboard/enacal/assignments');
  });

  it('usa fallback a enacal para roles no reconocidos', () => {
    expect(getDefaultRouteByRole('otro_rol')).toBe('/dashboard/enacal');
  });
});

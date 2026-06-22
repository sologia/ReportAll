import { getDefaultRouteByRole } from '../src/lib/rbac';

describe('rbac.js - getDefaultRouteByRole', () => {
  test('debe devolver la ruta por defecto correcta para cada rol', () => {
    expect(getDefaultRouteByRole('cliente')).toBe('/dashboard/clientes');
    expect(getDefaultRouteByRole('administrador')).toBe('/dashboard/enacal');
    expect(getDefaultRouteByRole('director_it')).toBe('/dashboard/enacal');
    expect(getDefaultRouteByRole('cuadrilla')).toBe('/dashboard/enacal/crew/reports');
    expect(getDefaultRouteByRole('lider_cuadrilla')).toBe('/dashboard/enacal/assignments');
    expect(getDefaultRouteByRole('trabajador')).toBe('/dashboard/enacal');
  });

  test('debe usar la ruta de enacal para roles desconocidos o vacíos', () => {
    expect(getDefaultRouteByRole('desconocido')).toBe('/dashboard/enacal');
    expect(getDefaultRouteByRole(null)).toBe('/dashboard/enacal');
  });
});


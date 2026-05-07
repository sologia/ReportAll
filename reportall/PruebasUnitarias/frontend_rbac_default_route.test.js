import { getDefaultRouteByRole } from '../src/lib/rbac';

describe('rbac.js - getDefaultRouteByRole', () => {
  test('should return correct default route for each role', () => {
    expect(getDefaultRouteByRole('cliente')).toBe('/dashboard/clientes');
    expect(getDefaultRouteByRole('administrador')).toBe('/dashboard/enacal');
    expect(getDefaultRouteByRole('director_it')).toBe('/dashboard/enacal/reports/summary');
    expect(getDefaultRouteByRole('cuadrilla')).toBe('/dashboard/enacal/crew/reports');
    expect(getDefaultRouteByRole('lider_cuadrilla')).toBe('/dashboard/enacal/assignments');
    expect(getDefaultRouteByRole('trabajador')).toBe('/dashboard/enacal');
  });
});


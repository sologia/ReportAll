import { isPathAllowedForRole } from '../src/lib/rbac';

describe('rbac.js - isPathAllowedForRole', () => {
  test('debe verificar el control de acceso para distintos roles y rutas del dashboard', () => {
    expect(isPathAllowedForRole('cliente', '/dashboard/clientes')).toBe(true);
    expect(isPathAllowedForRole('cliente', '/dashboard/enacal')).toBe(false);
    expect(isPathAllowedForRole('administrador', '/dashboard/clientes')).toBe(true);
    expect(isPathAllowedForRole('administrador', '/dashboard/enacal')).toBe(true);
  });

  test('debe permitir rutas fuera del dashboard y rechazar rutas de dashboard para roles desconocidos', () => {
    expect(isPathAllowedForRole('cliente', '/some-other-path')).toBe(true);
    expect(isPathAllowedForRole('unknown-role', '/dashboard/clientes')).toBe(false);
    expect(isPathAllowedForRole(null, undefined)).toBe(true);
  });

  test('debe normalizar roles y permitir rutas exactas o por prefijo para roles especializados', () => {
    expect(isPathAllowedForRole('  DIRECTOR_IT  ', '/dashboard/enacal')).toBe(true);
    expect(isPathAllowedForRole('director_it', '/dashboard/enacal/reports/summary/map')).toBe(true);
    expect(isPathAllowedForRole('cuadrilla', '/dashboard/enacal/crew/reports/15')).toBe(true);
    expect(isPathAllowedForRole('lider_cuadrilla', '/dashboard/enacal/reports/summary')).toBe(false);
  });
});


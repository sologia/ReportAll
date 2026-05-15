import { isPathAllowedForRole } from '../src/lib/rbac';

describe('rbac.js - isPathAllowedForRole', () => {
  test('should verify access control for different roles and dashboard paths', () => {
    expect(isPathAllowedForRole('cliente', '/dashboard/clientes')).toBe(true);
    expect(isPathAllowedForRole('cliente', '/dashboard/enacal')).toBe(false);
    expect(isPathAllowedForRole('administrador', '/dashboard/clientes')).toBe(true);
    expect(isPathAllowedForRole('administrador', '/dashboard/enacal')).toBe(true);
  });

  test('should allow non-dashboard paths and reject dashboard paths for unknown roles', () => {
    expect(isPathAllowedForRole('cliente', '/some-other-path')).toBe(true);
    expect(isPathAllowedForRole('unknown-role', '/dashboard/clientes')).toBe(false);
    expect(isPathAllowedForRole(null, undefined)).toBe(true);
  });

  test('should normalize roles and allow exact or prefixed routes for specialized roles', () => {
    expect(isPathAllowedForRole('  DIRECTOR_IT  ', '/dashboard/enacal')).toBe(true);
    expect(isPathAllowedForRole('director_it', '/dashboard/enacal/reports/summary/map')).toBe(true);
    expect(isPathAllowedForRole('cuadrilla', '/dashboard/enacal/crew/reports/15')).toBe(true);
    expect(isPathAllowedForRole('lider_cuadrilla', '/dashboard/enacal/reports/summary')).toBe(false);
  });
});


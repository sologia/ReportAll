import { isPathAllowedForRole } from '../src/lib/rbac';

describe('rbac.js - isPathAllowedForRole', () => {
  test('should verify access control for different roles and paths', () => {
    expect(isPathAllowedForRole('cliente', '/dashboard/clientes')).toBe(true);
    expect(isPathAllowedForRole('cliente', '/dashboard/enacal')).toBe(false);
    expect(isPathAllowedForRole('administrador', '/dashboard/clientes')).toBe(true);
    expect(isPathAllowedForRole('administrador', '/dashboard/enacal')).toBe(true);
    expect(isPathAllowedForRole('cliente', '/some-other-path')).toBe(true); // Non-dashboard allowed
  });
});


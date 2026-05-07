const { canViewIds } = require('../src/lib/rbac');

describe('rbac.js - canViewIds', () => {
  test('should return true only for administrador role', () => {
    expect(canViewIds('administrador')).toBe(true);
    expect(canViewIds('cliente')).toBe(false);
    expect(canViewIds('director_it')).toBe(false);
    expect(canViewIds('cuadrilla')).toBe(false);
  });
});


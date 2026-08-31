import { canViewIds } from '../src/lib/rbac';

describe('rbac.js - canViewIds', () => {
  test('debe devolver true sólo para el rol administrador', () => {
    expect(canViewIds('administrador')).toBe(true);
    expect(canViewIds('cliente')).toBe(false);
    expect(canViewIds('director_it')).toBe(false);
    expect(canViewIds('cuadrilla')).toBe(false);
  });

  test('debe normalizar el valor del rol antes de evaluar el acceso', () => {
    expect(canViewIds('  ADMINISTRADOR  ')).toBe(true);
    expect(canViewIds(undefined)).toBe(false);
  });
});


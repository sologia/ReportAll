const DASHBOARD_PREFIX = '/dashboard';

export const ROLES = {
  CLIENTE: 'cliente',
  ADMINISTRADOR: 'administrador',
  DIRECTOR_IT: 'director_it',
  CUADRILLA: 'cuadrilla',
  LIDER_CUADRILLA: 'lider_cuadrilla',
  TRABAJADOR: 'trabajador',
};

const roleRules = {
  [ROLES.CLIENTE]: {
    exact: [],
    prefixes: ['/dashboard/clientes'],
  },
  [ROLES.ADMINISTRADOR]: {
    exact: [],
    prefixes: ['/dashboard'],
  },
  [ROLES.DIRECTOR_IT]: {
    exact: ['/dashboard/enacal'],
    prefixes: [
      '/dashboard/enacal/reports/summary',
      '/dashboard/enacal/reports/summary/map',
      '/dashboard/enacal/reports/statistics',
      '/dashboard/enacal/craw/report-summary',
    ],
  },
  [ROLES.CUADRILLA]: {
    exact: ['/dashboard/enacal'],
    prefixes: ['/dashboard/enacal/crew/reports'],
  },
  [ROLES.LIDER_CUADRILLA]: {
    exact: ['/dashboard/enacal'],
    prefixes: ['/dashboard/enacal/assignments'],
  },
  [ROLES.TRABAJADOR]: {
    exact: [],
    prefixes: ['/dashboard/enacal'],
  },
};

export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function canViewIds(role) {
  return normalizeRole(role) === ROLES.ADMINISTRADOR;
}

export function getDefaultRouteByRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.CLIENTE) return '/dashboard/clientes';
  if (normalized === ROLES.ADMINISTRADOR) return '/dashboard/enacal';
  if (normalized === ROLES.DIRECTOR_IT) return '/dashboard/enacal/reports/summary';
  if (normalized === ROLES.CUADRILLA) return '/dashboard/enacal/crew/reports';
  if (normalized === ROLES.LIDER_CUADRILLA) return '/dashboard/enacal/assignments';
  return '/dashboard/enacal';
}

export function isPathAllowedForRole(role, pathname) {
  const normalizedRole = normalizeRole(role);
  const normalizedPath = String(pathname || '').trim();

  if (!normalizedPath.startsWith(DASHBOARD_PREFIX)) {
    return true;
  }

  const rules = roleRules[normalizedRole] || { exact: [], prefixes: [] };
  if (rules.exact.includes(normalizedPath)) {
    return true;
  }

  return rules.prefixes.some((prefix) => normalizedPath.startsWith(prefix));
}

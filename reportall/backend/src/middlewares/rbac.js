export function attachAuthContext(req, res, next) {
  const role = String(req.header('x-user-role') || '').trim().toLowerCase();
  const clientIdRaw = req.header('x-client-id');
  const leaderCrewIdRaw = req.header('x-leader-crew-id');
  const crewIdRaw = req.header('x-crew-id');

  const parseIntOrNull = (value) => {
    const parsed = Number.parseInt(String(value || ''), 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  req.auth = {
    role,
    clientId: parseIntOrNull(clientIdRaw),
    leaderCrewId: parseIntOrNull(leaderCrewIdRaw),
    crewId: parseIntOrNull(crewIdRaw),
  };

  next();
}

export function requireRoles(allowedRoles = []) {
  const normalized = allowedRoles.map((value) => String(value || '').trim().toLowerCase());

  return (req, res, next) => {
    const userRole = String(req.auth?.role || '').trim().toLowerCase();
    if (!userRole || !normalized.includes(userRole)) {
      return res.status(403).json({ message: 'No autorizado para esta acción' });
    }

    next();
  };
}
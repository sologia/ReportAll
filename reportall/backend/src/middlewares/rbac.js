import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'reportall_auth';

function parseIntOrNull(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function decodeJwtFromRequest(req) {
  const cookiesHeader = String(req.header('cookie') || '');

  let cookieToken = '';
  if (cookiesHeader) {
    const parsed = cookiesHeader.split(';').map((part) => part.trim());
    for (const item of parsed) {
      if (!item) continue;
      const equalIndex = item.indexOf('=');
      if (equalIndex < 0) continue;

      const key = item.slice(0, equalIndex).trim();
      const value = item.slice(equalIndex + 1).trim();
      if (key === AUTH_COOKIE_NAME) {
        try {
          cookieToken = decodeURIComponent(value);
        } catch {
          cookieToken = value;
        }
        break;
      }
    }
  }

  const authorizationHeader = String(req.header('authorization') || '').trim();
  let bearerToken = '';
  if (authorizationHeader.toLowerCase().startsWith('bearer ')) {
    bearerToken = authorizationHeader.slice(7).trim();
  }

  const token = bearerToken || cookieToken;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return {
      role: String(payload?.role || '').trim().toLowerCase(),
      clientId: parseIntOrNull(payload?.clientId),
      leaderCrewId: parseIntOrNull(payload?.leaderCrewId),
      crewId: parseIntOrNull(payload?.crewId),
      userId: parseIntOrNull(payload?.userId),
      email: String(payload?.email || '').trim().toLowerCase(),
      displayName: String(payload?.displayName || '').trim(),
    };
  } catch {
    return null;
  }
}

function decodeLegacyHeaders(req) {
  const role = String(req.header('x-user-role') || '').trim().toLowerCase();
  const clientIdRaw = req.header('x-client-id');
  const leaderCrewIdRaw = req.header('x-leader-crew-id');
  const crewIdRaw = req.header('x-crew-id');

  return {
    role,
    clientId: parseIntOrNull(clientIdRaw),
    leaderCrewId: parseIntOrNull(leaderCrewIdRaw),
    crewId: parseIntOrNull(crewIdRaw),
    userId: null,
    email: '',
    displayName: '',
  };
}

export function attachAuthContext(req, res, next) {
  const jwtContext = decodeJwtFromRequest(req);
  const legacyContext = decodeLegacyHeaders(req);

  req.auth = jwtContext || legacyContext;

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
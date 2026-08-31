const SESSION_KEY = 'reportall_session';
const TOKEN_KEY = 'reportall_token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || '';
}

function safeParse(jsonText, fallbackValue) {
  try {
    return JSON.parse(jsonText);
  } catch {
    return fallbackValue;
  }
}

function setCookie(name, value, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') return;
  const encodedValue = encodeURIComponent(value);
  document.cookie = `${name}=${encodedValue}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getSession() {
  const raw = getCookie(SESSION_KEY);
  if (raw) return safeParse(raw, null);

  // Fallback temporal: migra sesiones antiguas guardadas en localStorage.
  if (typeof window !== 'undefined') {
    const legacyRaw = localStorage.getItem(SESSION_KEY);
    if (legacyRaw) {
      const parsed = safeParse(legacyRaw, null);
      if (parsed) {
        setSession(parsed);
      }
      localStorage.removeItem(SESSION_KEY);
      return parsed;
    }
  }

  return null;
}

export function setSession(session) {
  if (!session) return;
  setCookie(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  deleteCookie(SESSION_KEY);
  deleteCookie(TOKEN_KEY);

  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getAccessToken() {
  return getCookie(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (!token) return;
  setCookie(TOKEN_KEY, token);
}

export function buildSessionHeaders(session = getSession()) {
  const headers = {};
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!session) return headers;

  // Compatibilidad temporal con middleware legacy durante migracion.
  if (!headers.Authorization) {
    if (session.role) headers['x-user-role'] = String(session.role);
    if (session.clientId !== undefined && session.clientId !== null) headers['x-client-id'] = String(session.clientId);
    if (session.leaderCrewId !== undefined && session.leaderCrewId !== null) headers['x-leader-crew-id'] = String(session.leaderCrewId);
    if (session.crewId !== undefined && session.crewId !== null) headers['x-crew-id'] = String(session.crewId);
  }

  return headers;
}

export async function loginUser({ email, password, role }) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    const session = body?.user || null;
    const token = body?.token || null;

    if (!session) {
      return null;
    }

    setSession(session);
    if (token) {
      setAccessToken(token);
    } else {
      deleteCookie(TOKEN_KEY);
    }
    return session;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    const base = getApiBase();
    await fetch(`${base}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // intencionalmente vacio: siempre limpiamos cliente al final
  } finally {
    clearSession();
  }
}

export async function refreshAccessToken() {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...buildSessionHeaders(getSession()),
      },
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.user) {
      return { ok: false, status: response.status, body };
    }

    setSession(body.user);
    if (body?.token) {
      setAccessToken(body.token);
    }

    return { ok: true, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, body: { message: error?.message || 'refresh failed' } };
  }
}

export async function registerUser(userData) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, message: body?.message || 'No se pudo registrar usuario' };
    }

    return { ok: true, user: body?.user || null };
  } catch {
    return { ok: false, message: 'No se pudo conectar con el servidor de autenticación' };
  }
}

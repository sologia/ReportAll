const SESSION_KEY = 'reportall_session';

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

export function getSession() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return safeParse(raw, null);
}

export function setSession(session) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export async function loginUser({ email, password, role }) {
  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    if (role && session?.role !== role) {
      return null;
    }

    setSession(session);
    return session;
  } catch {
    return null;
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

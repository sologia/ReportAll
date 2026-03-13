const USERS_KEY = 'reportall_users';
const SESSION_KEY = 'reportall_session';

const defaultUsers = [
  {
    email: 'trabajador@enacal.com',
    password: '123456',
    role: 'trabajador',
    displayName: 'Trabajador ENACAL',
    clientId: null,
  },
  {
    email: 'cliente@enacal.com',
    password: '123456',
    role: 'cliente',
    displayName: 'Cliente Demo',
    clientId: 1,
  },
];

function safeParse(jsonText, fallbackValue) {
  try {
    return JSON.parse(jsonText);
  } catch {
    return fallbackValue;
  }
}

export function getUsers() {
  if (typeof window === 'undefined') return defaultUsers;

  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  const parsed = safeParse(raw, defaultUsers);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  return parsed;
}

export function saveUsers(users) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

export function loginUser({ email, password, role }) {
  const users = getUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const found = users.find(
    (user) =>
      String(user.email || '').trim().toLowerCase() === normalizedEmail &&
      user.password === password &&
      (!role || user.role === role)
  );

  if (!found) return null;

  const session = {
    email: found.email,
    role: found.role,
    displayName: found.displayName || found.email,
    clientId: found.clientId ?? null,
  };

  setSession(session);
  return session;
}

export function registerUser(userData) {
  const users = getUsers();
  const normalizedEmail = String(userData.email || '').trim().toLowerCase();

  const exists = users.some((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail);
  if (exists) {
    return { ok: false, message: 'Este correo ya está registrado' };
  }

  const nextUser = {
    email: normalizedEmail,
    password: userData.password,
    role: userData.role,
    displayName: userData.displayName || normalizedEmail,
    clientId: userData.clientId ?? null,
  };

  const updated = [...users, nextUser];
  saveUsers(updated);

  return { ok: true, user: nextUser };
}

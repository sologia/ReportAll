import { getSession, setSession } from '../src/lib/auth';

describe('auth.js - getSession & setSession', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
    localStorage.clear();
  });

  test('should store session in cookie named reportall_session, JSON-encoded', () => {
    const session = { userId: 1, role: 'cliente' };

    setSession(session);

    expect(document.cookie).toContain('reportall_session=');
    expect(document.cookie).toContain(encodeURIComponent(JSON.stringify(session)));
  });

  test('should retrieve session from cookie', () => {
    const session = { userId: 1, role: 'cliente' };
    document.cookie = `reportall_session=${encodeURIComponent(JSON.stringify(session))}; Path=/`;

    const result = getSession();

    expect(result).toEqual(session);
  });

  test('should migrate a legacy localStorage session into cookies', () => {
    const session = { userId: 9, role: 'administrador' };
    localStorage.setItem('reportall_session', JSON.stringify(session));

    const result = getSession();

    expect(result).toEqual(session);
    expect(document.cookie).toContain('reportall_session=');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });

  test('should return null for an invalid cookie payload', () => {
    document.cookie = 'reportall_session=%7Bbad-json; Path=/';

    expect(getSession()).toBeNull();
  });
});


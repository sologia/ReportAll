import { getSession, setSession } from '../src/lib/auth';

describe('auth.js - getSession & setSession', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
    localStorage.clear();
  });

  test('debe guardar la sesión en la cookie reportall_session codificada como JSON', () => {
    const session = { userId: 1, role: 'cliente' };

    setSession(session);

    expect(document.cookie).toContain('reportall_session=');
    expect(document.cookie).toContain(encodeURIComponent(JSON.stringify(session)));
  });

  test('debe recuperar la sesión desde la cookie', () => {
    const session = { userId: 1, role: 'cliente' };
    document.cookie = `reportall_session=${encodeURIComponent(JSON.stringify(session))}; Path=/`;

    const result = getSession();

    expect(result).toEqual(session);
  });

  test('debe migrar una sesión legacy de localStorage a cookies', () => {
    const session = { userId: 9, role: 'administrador' };
    localStorage.setItem('reportall_session', JSON.stringify(session));

    const result = getSession();

    expect(result).toEqual(session);
    expect(document.cookie).toContain('reportall_session=');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });

  test('debe devolver null para un payload inválido en la cookie', () => {
    document.cookie = 'reportall_session=%7Bbad-json; Path=/';

    expect(getSession()).toBeNull();
  });
});


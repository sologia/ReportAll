import { clearSession } from '../src/lib/auth';

describe('auth.js - clearSession', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
    localStorage.clear();
  });

  test('debe eliminar las cookies SESSION_KEY y TOKEN_KEY y limpiar localStorage', () => {
    document.cookie = 'reportall_session=test; Path=/';
    document.cookie = 'reportall_token=test; Path=/';
    localStorage.setItem('reportall_session', 'legacy');

    clearSession();

    expect(document.cookie).not.toContain('reportall_session=test');
    expect(document.cookie).not.toContain('reportall_token=test');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });

  test('debe ser seguro llamarla varias veces', () => {
    clearSession();
    clearSession();

    expect(document.cookie).not.toContain('reportall_session=test');
    expect(document.cookie).not.toContain('reportall_token=test');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });
});


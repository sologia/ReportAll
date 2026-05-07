import { clearSession } from '../src/lib/auth';

describe('auth.js - clearSession', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
    localStorage.clear();
  });

  test('should delete SESSION_KEY and TOKEN_KEY cookies, clear localStorage', () => {
    document.cookie = 'reportall_session=test; Path=/';
    document.cookie = 'reportall_token=test; Path=/';
    localStorage.setItem('reportall_session', 'legacy');

    clearSession();

    expect(document.cookie).toContain('reportall_token=;');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });
});


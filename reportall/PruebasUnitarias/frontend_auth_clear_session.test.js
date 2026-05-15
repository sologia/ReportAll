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

    expect(document.cookie).not.toContain('reportall_session=test');
    expect(document.cookie).not.toContain('reportall_token=test');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });

  test('should be safe to call multiple times', () => {
    clearSession();
    clearSession();

    expect(document.cookie).not.toContain('reportall_session=test');
    expect(document.cookie).not.toContain('reportall_token=test');
    expect(localStorage.getItem('reportall_session')).toBeNull();
  });
});


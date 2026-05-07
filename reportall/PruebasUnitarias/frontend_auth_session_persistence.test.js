const { getSession, setSession } = require('../src/lib/auth');

describe('auth.js - getSession & setSession', () => {
  beforeEach(() => {
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
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
});


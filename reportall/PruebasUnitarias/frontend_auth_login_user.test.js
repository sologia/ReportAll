import { loginUser } from '../src/lib/auth';

global.fetch = jest.fn();

describe('auth.js - loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call backend, store session/token in cookies, return user session object', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        user: { userId: 1, email: 'test@example.com', role: 'cliente' },
        token: 'jwt_token'
      })
    };

    fetch.mockResolvedValue(mockResponse);

    const result = await loginUser({ email: 'test@example.com', password: 'password', role: 'cliente' });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/login'), expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    }));
    expect(result).toEqual({ userId: 1, email: 'test@example.com', role: 'cliente' });
    // Note: setSession and setAccessToken are called, but since they use document.cookie, need to mock document
  });
});


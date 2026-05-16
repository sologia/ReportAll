import { loginUser } from '../src/lib/auth';

global.fetch = jest.fn();

describe('auth.js - loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
  });

  test('debe llamar al backend, guardar sesión y token en cookies y devolver el objeto de sesión', async () => {
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
    expect(document.cookie).toContain('reportall_token=jwt_token');
  });

  test('debe devolver null cuando el backend responde con error', async () => {
    fetch.mockResolvedValue({ ok: false, status: 401 });

    const result = await loginUser({ email: 'bad@example.com', password: 'wrong' });

    expect(result).toBeNull();
    expect(document.cookie).toBe('');
  });

  test('debe devolver null cuando falla la petición de red', async () => {
    fetch.mockRejectedValue(new Error('network down'));

    const result = await loginUser({ email: 'test@example.com', password: 'password' });

    expect(result).toBeNull();
    expect(document.cookie).toBe('');
  });
});


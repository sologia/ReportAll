import { jest } from '@jest/globals';

const mockSql = {
  NVarChar: jest.fn((len) => ({ type: 'NVarChar', length: len })),
  Int: jest.fn((len) => ({ type: 'Int', length: len })),
  Date: jest.fn(() => ({ type: 'Date' }))
};

const mockPool = {
  request: jest.fn().mockReturnThis(),
  input: jest.fn().mockReturnThis(),
  execute: jest.fn()
};

jest.mock('../backend/src/config/db.js', () => ({
  poolPromise: Promise.resolve(mockPool),
  sql: mockSql
}));

let login;
beforeAll(async () => {
  ({ login } = await import('../backend/src/Controllers/AuthController.js'));
});

describe('AuthController - login', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { email: 'invalid@example.com', password: 'wrongpassword' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
    next = jest.fn();
    mockPool.execute.mockReset();
  });

  test('should return 401 for invalid credentials', async () => {
    mockPool.execute.mockResolvedValue({ recordset: [] });

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
    expect(res.cookie).not.toHaveBeenCalled();
  });
});


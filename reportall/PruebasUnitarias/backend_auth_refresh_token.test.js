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

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

const { refresh } = await import('../backend/src/Controllers/AuthController.js');
const jwt = await import('jsonwebtoken');

describe('AuthController - refresh', () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
    next = jest.fn();
    mockPool.execute.mockReset();
  });

  test('should return 401 when refresh token is invalid or expired', async () => {
    req.header.mockReturnValue('reportall_refresh=invalid_refresh_token');
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

    await refresh(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalid_refresh_token', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token inválido o expirado' });
  });
});


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

let refresh;
let jwt;

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

beforeAll(async () => {
  ({ refresh } = await import('../backend/src/Controllers/AuthController.js'));
  const jwtModule = await import('jsonwebtoken');
  jwt = jwtModule.default ?? jwtModule;
});

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
    mockPool.request.mockClear();
    mockPool.input.mockClear();
    jwt.verify.mockReset();
    jwt.sign.mockReset();
  });

  test('debe devolver 401 cuando el refresh token es inválido o expiró', async () => {
    req.header.mockReturnValue('reportall_refresh=invalid_refresh_token');
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

    await refresh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token inválido o expirado' });
  });

  test('debe devolver 401 cuando falta la cookie del refresh token', async () => {
    req.header.mockReturnValue('');

    await refresh(req, res, next);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token requerido' });
  });

  test('debe rechazar un payload de token mal formado en la cookie', async () => {
    req.header.mockReturnValue('reportall_refresh=valid_refresh_token');
    jwt.verify.mockReturnValue({ sub: '1', email: 'test@example.com', tokenId: 'token-1', type: 'refresh' });

    await refresh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token inválido o expirado' });
    expect(mockPool.execute).not.toHaveBeenCalled();
  });
});


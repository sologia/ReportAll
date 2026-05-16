import { jest } from '@jest/globals';
import crypto from 'crypto';

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
    req = { body: { email: 'test@example.com', password: 'password' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
    next = jest.fn();
    mockPool.execute.mockReset();
    mockPool.request.mockClear();
    mockPool.input.mockClear();
  });

  test('debe devolver JWT y refresh token en un inicio de sesión exitoso', async () => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('password', salt, 100000, 64, 'sha512').toString('hex');

    const mockUser = {
      User_ID: 1,
      Email: 'test@example.com',
      Role: 'cliente',
      Display_Name: 'Test User',
      Client_ID: null,
      Leader_Crew_ID: null,
      Crew_ID: null,
      Is_Active: true,
      Password_Salt: salt,
      Password_Hash: hash
    };

    mockPool.execute.mockResolvedValue({ recordset: [mockUser] });

    await login(req, res, next);

    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.input).toHaveBeenCalledWith('Email', mockSql.NVarChar(255), 'test@example.com');
    expect(mockPool.execute).toHaveBeenCalledWith('sp_Auth_GetUserByEmail');
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      tokenType: 'Bearer',
      user: expect.objectContaining({
        userId: 1,
        email: 'test@example.com',
        role: 'cliente'
      })
    }));
  });

  test('debe llamar a next cuando falla la consulta a la base de datos', async () => {
    const dbError = new Error('db failure');
    mockPool.execute.mockRejectedValue(dbError);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });

  test('debe normalizar el correo antes de consultar la base de datos', async () => {
    req.body.email = '  TEST@EXAMPLE.COM  ';

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('password', salt, 100000, 64, 'sha512').toString('hex');

    mockPool.execute.mockResolvedValue({
      recordset: [{
        User_ID: 1,
        Email: 'test@example.com',
        Role: 'cliente',
        Display_Name: 'Test User',
        Client_ID: null,
        Leader_Crew_ID: null,
        Crew_ID: null,
        Is_Active: true,
        Password_Salt: salt,
        Password_Hash: hash,
      }],
    });

    await login(req, res, next);

    expect(mockPool.input).toHaveBeenCalledWith('Email', mockSql.NVarChar(255), 'test@example.com');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ email: 'test@example.com' }),
    }));
  });
});


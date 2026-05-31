import { jest } from '@jest/globals';

const mockSql = {
  NVarChar: jest.fn((len) => ({ type: 'NVarChar', length: len })),
  Int: jest.fn((len) => ({ type: 'Int', length: len })),
};

const mockPool = {
  request: jest.fn(),
};

jest.mock('../backend/src/config/db.js', () => ({
  poolPromise: Promise.resolve(mockPool),
  sql: mockSql,
}));

let listCrewAccounts;
let resetCrewPassword;

beforeAll(async () => {
  ({ listCrewAccounts, resetCrewPassword } = await import('../backend/src/Controllers/AuthController.js'));
});

describe('AuthController - crew accounts', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { userId: '5' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('lista las cuentas de cuadrilla', async () => {
    const rows = [{ User_ID: 5, Email: 'cuadrilla.5@reportall.local', Num_Crew: 12, Is_Active: true }];
    const mockRequest = {
      execute: jest.fn().mockResolvedValue({ recordset: rows }),
    };

    mockPool.request.mockReturnValue(mockRequest);

    await listCrewAccounts(req, res, next);

    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Auth_GetCrewAccounts');
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('regenera una contraseña temporal para una cuenta de cuadrilla', async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        recordset: [{ User_ID: 5, Email: 'cuadrilla.5@reportall.local', Crew_ID: 9, Display_Name: 'Cuadrilla 12', Is_Active: true }],
      }),
    };

    mockPool.request.mockReturnValue(mockRequest);

    await resetCrewPassword(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('User_ID', mockSql.Int, 5);
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Auth_UpdatePassword');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      password: expect.any(String),
      account: expect.objectContaining({ User_ID: 5 }),
    }));
  });
});
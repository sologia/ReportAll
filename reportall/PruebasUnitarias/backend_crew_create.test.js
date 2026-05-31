import { jest } from '@jest/globals';

const mockSql = {
  NVarChar: jest.fn((len) => ({ type: 'NVarChar', length: len })),
  Int: jest.fn((len) => ({ type: 'Int', length: len })),
  Date: jest.fn(() => ({ type: 'Date' }))
};

const mockPool = {
  request: jest.fn()
};

jest.mock('../backend/src/config/db.js', () => ({
  poolPromise: Promise.resolve(mockPool),
  sql: mockSql
}));

let create;
beforeAll(async () => {
  ({ create } = await import('../backend/src/Controllers/CrewController.js'));
});

describe('CrewController - create', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { Availability: 'Available', Sector: 'Sector1', Plate: 'ABC123', Num_Crew: 5 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('debe crear una nueva cuadrilla, generar credenciales y devolver 201 con el resultado', async () => {
    const mockResult = { Crew_ID: 1, Name: 'New Crew' };
    const execute = jest.fn()
      .mockResolvedValueOnce({ recordset: [mockResult] })
      .mockResolvedValueOnce({ recordset: [] })
      .mockResolvedValueOnce({ recordset: [{ User_ID: 10, Email: 'cuadrilla.1@reportall.local' }] });

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute
    };

    mockPool.request.mockReturnValue(mockRequest);

    await create(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('Availability', mockSql.NVarChar(250), 'Available');
    expect(mockRequest.input).toHaveBeenCalledWith('Sector', mockSql.NVarChar(250), 'Sector1');
    expect(mockRequest.input).toHaveBeenCalledWith('Plate', mockSql.NVarChar(20), 'ABC123');
    expect(mockRequest.input).toHaveBeenCalledWith('Num_Crew', mockSql.Int, 5);
    expect(execute).toHaveBeenNthCalledWith(1, 'sp_InsertCrew');
    expect(execute).toHaveBeenNthCalledWith(2, 'sp_Auth_GetUserByEmail');
    expect(execute).toHaveBeenNthCalledWith(3, 'sp_Auth_CreateUser');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      Crew_ID: 1,
      Name: 'New Crew',
      access: expect.objectContaining({
        email: 'cuadrilla.1@reportall.local',
        password: expect.any(String),
        role: 'cuadrilla',
      }),
    }));
  });

  test('debe resolver el Crew_ID por número cuando el procedimiento no retorna filas', async () => {
    const execute = jest.fn()
      .mockResolvedValueOnce({ recordset: [] })
      .mockResolvedValueOnce({ recordset: [{ Crew_ID: 9 }] })
      .mockResolvedValueOnce({ recordset: [] })
      .mockResolvedValueOnce({ recordset: [{ User_ID: 22, Email: 'cuadrilla.9@reportall.local' }] });

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute
    };

    mockPool.request.mockReturnValue(mockRequest);

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(execute).toHaveBeenNthCalledWith(2, 'sp_Auth_FindCrewByNumber');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      access: expect.objectContaining({
        email: 'cuadrilla.9@reportall.local',
        password: expect.any(String),
      }),
    }));
  });

  test('debe llamar a next cuando falla el procedimiento de creación', async () => {
    const dbError = new Error('crew create failed');
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockRejectedValue(dbError)
    };

    mockPool.request.mockReturnValue(mockRequest);

    await create(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });
});


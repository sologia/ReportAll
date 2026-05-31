import { jest } from '@jest/globals';

const mockSql = {
  NVarChar: jest.fn((len) => ({ type: 'NVarChar', length: len })),
};

const mockPool = {
  request: jest.fn(),
};

jest.mock('../backend/src/config/db.js', () => ({
  poolPromise: Promise.resolve(mockPool),
  sql: mockSql,
}));

let create;
beforeAll(async () => {
  ({ create } = await import('../backend/src/Controllers/VehicleController.js'));
});

describe('VehicleController - create', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { Plate: 'mz1234' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('crea una matrícula en mayúsculas y devuelve 201', async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: [{ Vehicle_ID: 7, Plate: 'MZ1234' }] }),
    };

    mockPool.request.mockReturnValue(mockRequest);

    await create(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('Plate', mockSql.NVarChar(20), 'MZ1234');
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Vehicle_Create');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ Vehicle_ID: 7, Plate: 'MZ1234' });
  });

  test('rechaza una matrícula vacía', async () => {
    req.body.Plate = '   ';

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'La matrícula es requerida' });
  });
});
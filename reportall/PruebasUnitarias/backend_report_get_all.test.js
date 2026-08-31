import { jest } from '@jest/globals';

const mockPool = {
  request: jest.fn().mockReturnThis(),
  execute: jest.fn()
};

jest.mock('../backend/src/config/db.js', () => ({
  poolPromise: Promise.resolve(mockPool),
  sql: {
    NVarChar: jest.fn(),
    Int: jest.fn(),
    Date: jest.fn()
  }
}));

let getAll;
beforeAll(async () => {
  ({ getAll } = await import('../backend/src/Controllers/ReportController.js'));
});

describe('ReportController - getAll', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { json: jest.fn() };
    next = jest.fn();
    mockPool.execute.mockReset();
    mockPool.request.mockClear();
  });

  test('debe ejecutar sp_SelectReport y devolver el recordset', async () => {
    const mockRecords = [{ id: 1, title: 'Report 1' }, { id: 2, title: 'Report 2' }];

    mockPool.execute.mockResolvedValue({ recordset: mockRecords });

    await getAll(req, res, next);

    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.execute).toHaveBeenCalledWith('sp_SelectReport');
    expect(res.json).toHaveBeenCalledWith(mockRecords);
  });

  test('debe devolver un arreglo vacío cuando no hay reportes', async () => {
    mockPool.execute.mockResolvedValue({ recordset: [] });

    await getAll(req, res, next);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('debe llamar a next cuando falla la consulta de reportes', async () => {
    const dbError = new Error('report query failed');
    mockPool.execute.mockRejectedValue(dbError);

    await getAll(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});


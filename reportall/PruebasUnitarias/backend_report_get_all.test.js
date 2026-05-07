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

  test('should execute sp_SelectReport and return recordset', async () => {
    const mockRecords = [{ id: 1, title: 'Report 1' }, { id: 2, title: 'Report 2' }];

    mockPool.execute.mockResolvedValue({ recordset: mockRecords });

    await getAll(req, res, next);

    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.execute).toHaveBeenCalledWith('sp_SelectReport');
    expect(res.json).toHaveBeenCalledWith(mockRecords);
  });
});


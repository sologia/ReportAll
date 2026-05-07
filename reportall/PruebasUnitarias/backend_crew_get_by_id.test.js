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

let getById;
beforeAll(async () => {
  ({ getById } = await import('../backend/src/Controllers/CrewController.js'));
});

describe('CrewController - getById', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: 'abc' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockPool.input.mockClear();
    mockPool.execute.mockReset();
  });

  test('should return 400 for non-numeric ID, 404 for non-existent ID', async () => {
    await getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid id' });

    req.params.id = '999';
    mockPool.execute.mockResolvedValue({ recordset: [] });

    await getById(req, res, next);

    expect(mockPool.input).toHaveBeenCalledWith('id', mockSql.Int, 999);
    expect(mockPool.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });
});


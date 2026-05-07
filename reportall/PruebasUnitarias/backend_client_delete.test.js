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

const { remove } = await import('../backend/src/Controllers/ClientController.js');

describe('ClientController - remove', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: '999' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() };
    next = jest.fn();
    mockPool.input.mockClear();
    mockPool.execute.mockReset();
  });

  test('should return 404 for non-existent client', async () => {
    mockPool.execute.mockResolvedValue({ recordset: [] });

    await remove(req, res, next);

    expect(mockPool.input).toHaveBeenCalledWith('Client_ID', mockSql.Int, 999);
    expect(mockPool.execute).toHaveBeenCalledWith('sp_Client_Delete');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });
});


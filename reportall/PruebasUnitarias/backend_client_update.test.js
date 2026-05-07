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

const { update } = await import('../backend/src/Controllers/ClientController.js');

describe('ClientController - update', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: '1' }, body: { FirstName: 'NewName' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('should update client with partial fields, return 400 if no fields', async () => {
    const mockResult = { RowsAffected: 1 };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: [mockResult] })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await update(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('Client_ID', mockSql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith('FirstName', mockSql.NVarChar(100), 'NewName');
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Client_Update');
    expect(res.json).toHaveBeenCalledWith({ message: 'Updated successfully' });

    req.body = {};
    await update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No updatable fields provided' });
  });
});


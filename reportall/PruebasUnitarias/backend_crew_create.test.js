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

  test('should create new crew and return 201 with result', async () => {
    const mockResult = { Crew_ID: 1, Name: 'New Crew' };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: [mockResult] })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await create(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('Availability', mockSql.NVarChar(250), 'Available');
    expect(mockRequest.input).toHaveBeenCalledWith('Sector', mockSql.NVarChar(250), 'Sector1');
    expect(mockRequest.input).toHaveBeenCalledWith('Plate', mockSql.NVarChar(20), 'ABC123');
    expect(mockRequest.input).toHaveBeenCalledWith('Num_Crew', mockSql.Int, 5);
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_InsertCrew');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });
});


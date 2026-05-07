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

let getReportsByCrew;
beforeAll(async () => {
  ({ getReportsByCrew } = await import('../backend/src/Controllers/CrewController.js'));
});

describe('CrewController - getReportsByCrew', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: '1' }, auth: { role: 'cuadrilla', crewId: 1 }, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('should allow crew role to fetch their own crew reports, deny other crew', async () => {
    const mockRecords = [{ reportId: 1, title: 'Report' }];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: mockRecords })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getReportsByCrew(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('Crew_ID', mockSql.Int, 1);
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Crew_GetReportsByCrew');
    expect(res.json).toHaveBeenCalledWith(mockRecords);

    req.params.id = '2';
    req.auth.crewId = 1;

    await getReportsByCrew(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado para consultar reportes de otra cuadrilla' });
  });
});


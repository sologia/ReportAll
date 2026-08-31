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

let getSummary;
beforeAll(async () => {
  ({ getSummary } = await import('../backend/src/Controllers/ReportController.js'));
});

describe('ReportController - getSummary', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: { dateFrom: '2023-01-01', dateTo: '2023-12-31', state: 'State1', district: 'District1', sector: 'Sector1' } };
    res = { json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('debe enviar los parámetros de consulta a sp_Report_GetSummary', async () => {
    const mockRecords = [{ summary: 'data' }];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: mockRecords })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getSummary(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('DateFrom', mockSql.Date, '2023-01-01');
    expect(mockRequest.input).toHaveBeenCalledWith('DateTo', mockSql.Date, '2023-12-31');
    expect(mockRequest.input).toHaveBeenCalledWith('State', mockSql.NVarChar(100), 'State1');
    expect(mockRequest.input).toHaveBeenCalledWith('District', mockSql.NVarChar(200), 'District1');
    expect(mockRequest.input).toHaveBeenCalledWith('Sector', mockSql.NVarChar(200), 'Sector1');
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Report_GetSummary');
    expect(res.json).toHaveBeenCalledWith(mockRecords);
  });

  test('debe ejecutar el resumen sin filtros y devolver una lista vacía', async () => {
    req.query = {};

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: [] })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getSummary(req, res, next);

    expect(mockRequest.input).not.toHaveBeenCalled();
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Report_GetSummary');
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('debe llamar a next cuando falla la consulta del resumen', async () => {
    const dbError = new Error('summary failed');
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockRejectedValue(dbError)
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getSummary(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });
});


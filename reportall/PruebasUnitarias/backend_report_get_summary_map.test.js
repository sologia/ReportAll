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

let getSummaryMap;
beforeAll(async () => {
  ({ getSummaryMap } = await import('../backend/src/Controllers/ReportController.js'));
});

describe('ReportController - getSummaryMap', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: { dateFrom: '2023-01-01', state: 'State1', district: 'District1' } };
    res = { json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('debe obtener datos geoespaciales con filtros para visualizar el mapa', async () => {
    const mockRecords = [{ lat: 10, lng: 20, count: 5 }];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: mockRecords })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getSummaryMap(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('DateFrom', mockSql.Date, '2023-01-01');
    expect(mockRequest.input).toHaveBeenCalledWith('State', mockSql.NVarChar(100), 'State1');
    expect(mockRequest.input).toHaveBeenCalledWith('District', mockSql.NVarChar(200), 'District1');
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Report_GetSummaryMap');
    expect(res.json).toHaveBeenCalledWith(mockRecords);
  });

  test('debe permitir filtros vacíos y devolver una colección vacía', async () => {
    req.query = {};

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: [] })
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getSummaryMap(req, res, next);

    expect(mockRequest.input).not.toHaveBeenCalled();
    expect(mockRequest.execute).toHaveBeenCalledWith('sp_Report_GetSummaryMap');
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('debe llamar a next cuando falla la consulta del mapa de resumen', async () => {
    const dbError = new Error('summary map failed');
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockRejectedValue(dbError)
    };

    mockPool.request.mockReturnValue(mockRequest);

    await getSummaryMap(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });
});


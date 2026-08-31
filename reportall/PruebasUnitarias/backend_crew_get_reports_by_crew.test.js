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

  test('debe permitir a la cuadrilla consultar sus propios reportes y negar otras cuadrillas', async () => {
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

  test('debe permitir a roles no cuadrilla consultar otra cuadrilla', async () => {
    const mockRecords = [{ reportId: 10, title: 'Otro reporte' }];
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: mockRecords })
    };

    req.params.id = '3';
    req.auth = { role: 'administrador', crewId: 1 };
    mockPool.request.mockReturnValue(mockRequest);

    await getReportsByCrew(req, res, next);

    expect(mockRequest.input).toHaveBeenCalledWith('Crew_ID', mockSql.Int, 3);
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(mockRecords);
  });

  test('debe devolver 400 cuando el id de la cuadrilla es inválido', async () => {
    req.params.id = 'invalid';

    await getReportsByCrew(req, res, next);

    expect(mockPool.request).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid id' });
  });
});


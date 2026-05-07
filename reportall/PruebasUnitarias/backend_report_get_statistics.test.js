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

const { getStatistics } = await import('../backend/src/Controllers/ReportController.js');

describe('ReportController - getStatistics', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: { dateFrom: '2023-01-01', dateTo: '2023-12-31', district: 'District1' } };
    res = { json: jest.fn() };
    next = jest.fn();
    mockPool.request.mockReset();
  });

  test('should execute both sp_Report_GetStatisticsReports and crew stats SP, combine results', async () => {
    const mockReports = [
      { State: 'State1', Urgency: 'High', Problem: 'Issue1', District: 'District1', IsAssigned: true, IsSolved: true },
      { State: 'State2', Urgency: 'Low', Problem: 'Issue2', District: 'District2', IsAssigned: false, IsSolved: false }
    ];
    const mockCrews = [
      { Crew_Name: 'Crew1', Assigned_Total: 10, Solved_Total: 8 },
      { Crew_Name: 'Crew2', Assigned_Total: 5, Solved_Total: 3 }
    ];

    const mockReportRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: mockReports })
    };
    const mockCrewRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ recordset: mockCrews })
    };

    mockPool.request.mockReturnValueOnce(mockReportRequest).mockReturnValueOnce(mockCrewRequest);

    await getStatistics(req, res, next);

    expect(mockReportRequest.input).toHaveBeenCalledWith('DateFrom', mockSql.Date, '2023-01-01');
    expect(mockReportRequest.input).toHaveBeenCalledWith('DateTo', mockSql.Date, '2023-12-31');
    expect(mockReportRequest.input).toHaveBeenCalledWith('District', mockSql.NVarChar(200), 'District1');
    expect(mockReportRequest.execute).toHaveBeenCalledWith('sp_Report_GetStatisticsReports');

    expect(mockCrewRequest.input).toHaveBeenCalledWith('DateFrom', mockSql.Date, '2023-01-01');
    expect(mockCrewRequest.input).toHaveBeenCalledWith('DateTo', mockSql.Date, '2023-12-31');
    expect(mockCrewRequest.input).toHaveBeenCalledWith('District', mockSql.NVarChar(200), 'District1');
    expect(mockCrewRequest.execute).toHaveBeenCalledWith('sp_Report_GetStatisticsCrews');

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      overview: expect.objectContaining({
        totalReports: 2,
        totalAssigned: 1,
        totalSolved: 1
      }),
      charts: expect.objectContaining({
        byState: expect.any(Array),
        byUrgency: expect.any(Array)
      }),
      crews: expect.objectContaining({
        averages: expect.objectContaining({
          totalCrews: 2,
          activeCrews: 2
        }),
        ranking: expect.any(Array)
      })
    }));
  });
});


import { poolPromise, sql } from '../config/db.js';

// GET /api/reports
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_SelectReport');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/options
export async function getOptions(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_Report_GetOptions');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/urgencies
export async function getUrgencies(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_Report_GetUrgencies');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/summary?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&state=...&district=...
export async function getSummary(req, res, next) {
    try {
        const { dateFrom, dateTo, date, state, district, sector } = req.query;
        const pool = await poolPromise;
        const request = pool.request();

        if (dateFrom) request.input('DateFrom', sql.Date, dateFrom);
        if (dateTo) request.input('DateTo', sql.Date, dateTo);
        if (date) request.input('Date', sql.Date, date);
        if (state) request.input('State', sql.NVarChar(100), state);
        if (district) request.input('District', sql.NVarChar(200), district);
        if (sector) request.input('Sector', sql.NVarChar(200), sector);

        const result = await request.execute('sp_Report_GetSummary');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/summary-map?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&state=...&district=...
export async function getSummaryMap(req, res, next) {
    try {
        const { dateFrom, dateTo, date, state, district, sector } = req.query;
        const pool = await poolPromise;
        const request = pool.request();

        if (dateFrom) request.input('DateFrom', sql.Date, dateFrom);
        if (dateTo) request.input('DateTo', sql.Date, dateTo);
        if (date) request.input('Date', sql.Date, date);
        if (state) request.input('State', sql.NVarChar(100), state);
        if (district) request.input('District', sql.NVarChar(200), district);
        if (sector) request.input('Sector', sql.NVarChar(200), sector);

        const result = await request.execute('sp_Report_GetSummaryMap');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/statistics?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&district=...
export async function getStatistics(req, res, next) {
    try {
        const { dateFrom, dateTo, district } = req.query;
        const pool = await poolPromise;

        const reportRequest = pool.request();
        const crewRequest = pool.request();

        if (dateFrom) {
            reportRequest.input('DateFrom', sql.Date, dateFrom);
            crewRequest.input('DateFrom', sql.Date, dateFrom);
        }
        if (dateTo) {
            reportRequest.input('DateTo', sql.Date, dateTo);
            crewRequest.input('DateTo', sql.Date, dateTo);
        }
        if (district) {
            reportRequest.input('District', sql.NVarChar(200), district);
            crewRequest.input('District', sql.NVarChar(200), district);
        }

        const reportStatsResult = await reportRequest.execute('sp_Report_GetStatisticsReports');
        const crewStatsResult = await crewRequest.execute('sp_Report_GetStatisticsCrews');

        const reportsRows = reportStatsResult.recordset || [];
        const crewRowsRaw = crewStatsResult.recordset || [];

        const totalReports = reportsRows.length;
        const totalAssigned = reportsRows.reduce((sum, row) => sum + (row.IsAssigned ? 1 : 0), 0);
        const totalSolved = reportsRows.reduce((sum, row) => sum + (row.IsSolved ? 1 : 0), 0);

        const countByField = (rows, fieldName) => {
            const bucket = rows.reduce((acc, row) => {
                const key = row[fieldName] || 'Sin dato';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(bucket)
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
        };

        const byState = countByField(reportsRows, 'State');
        const byUrgency = countByField(reportsRows, 'Urgency');
        const byProblem = countByField(reportsRows, 'Problem').slice(0, 10);
        const byDistrict = countByField(reportsRows, 'District');

        const crewRows = crewRowsRaw.map((crew) => {
            const assigned = Number(crew.Assigned_Total) || 0;
            const solved = Number(crew.Solved_Total) || 0;
            const pending = Math.max(assigned - solved, 0);
            const solveRate = assigned > 0 ? (solved / assigned) * 100 : 0;

            return {
                ...crew,
                Assigned_Total: assigned,
                Solved_Total: solved,
                Pending_Total: pending,
                Solve_Rate: Number(solveRate.toFixed(2)),
            };
        });

        const activeCrews = crewRows.filter((crew) => crew.Assigned_Total > 0);
        const assignedByCrews = activeCrews.reduce((sum, crew) => sum + crew.Assigned_Total, 0);
        const solvedByCrews = activeCrews.reduce((sum, crew) => sum + crew.Solved_Total, 0);

        const avgAssigned = activeCrews.length > 0 ? assignedByCrews / activeCrews.length : 0;
        const avgSolved = activeCrews.length > 0 ? solvedByCrews / activeCrews.length : 0;
        const avgSolveRate = activeCrews.length > 0
            ? activeCrews.reduce((sum, crew) => sum + crew.Solve_Rate, 0) / activeCrews.length
            : 0;

        const response = {
            filtersApplied: {
                dateFrom: dateFrom || null,
                dateTo: dateTo || null,
                district: district || null,
            },
            overview: {
                totalReports,
                totalAssigned,
                totalSolved,
                assignmentRate: totalReports > 0 ? Number(((totalAssigned / totalReports) * 100).toFixed(2)) : 0,
                solvedRate: totalReports > 0 ? Number(((totalSolved / totalReports) * 100).toFixed(2)) : 0,
            },
            charts: {
                byState,
                byUrgency,
                byProblem,
                byDistrict,
            },
            crews: {
                averages: {
                    totalCrews: crewRows.length,
                    activeCrews: activeCrews.length,
                    avgAssigned: Number(avgAssigned.toFixed(2)),
                    avgSolved: Number(avgSolved.toFixed(2)),
                    avgSolveRate: Number(avgSolveRate.toFixed(2)),
                },
                ranking: crewRows,
            },
        };

        res.json(response);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/client/:clientId
export async function getByClient(req, res, next) {
    try {
        const clientId = parseInt(req.params.clientId, 10);
        if (Number.isNaN(clientId)) return res.status(400).json({ message: 'Invalid client id' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Client_ID', sql.Int, clientId)
            .execute('sp_Report_GetByClient');

        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/:id
export async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_SelectReportByID');
        const row = result.recordset[0];
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
}

// POST /api/reports
export async function create(req, res, next) {
    try {
        const { Name_Problem, Urgency, X, Y, Adress, Name_Sector, Date_Time, ClientID } = req.body;
        const pool = await poolPromise;
        const BINPhoto = req.file ? req.file.buffer : null;

        const request = pool.request()
            .input('Name_Problem', sql.NVarChar(100), Name_Problem)
            .input('Urgency', sql.NVarChar(200), Urgency)
            .input('X', sql.Float, X)
            .input('Y', sql.Float, Y)
            .input('BINPhoto', sql.VarBinary(sql.MAX), BINPhoto)
            .input('Adress', sql.NVarChar(200), Adress)
            .input('Name_Sector', sql.NVarChar(200), Name_Sector)
            .input('Date_Time', sql.DateTime, Date_Time)
            .input('ClientID', sql.Int, ClientID);

        const result = await request.execute('sp_InsertReport');
        res.status(201).json(result.recordset && result.recordset[0] ? result.recordset[0] : {});
    } catch (err) {
        next(err);
    }
}

// PUT /api/reports/:id
export async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const BINPhoto = req.file ? req.file.buffer : null;
        const { Name_Problem, Urgency, Adress, Name_Sector, Date_Time } = req.body;

        if (
            Name_Problem === undefined
            && Urgency === undefined
            && Adress === undefined
            && Name_Sector === undefined
            && Date_Time === undefined
            && BINPhoto === null
        ) {
            return res.status(400).json({ message: 'No updatable fields provided' });
        }

        const pool = await poolPromise;
        const request = pool.request().input('Report_ID', sql.Int, id);

        if (Name_Problem !== undefined) request.input('Name_Problem', sql.NVarChar(100), Name_Problem);
        if (Urgency !== undefined) request.input('Urgency', sql.NVarChar(200), Urgency);
        if (Adress !== undefined) request.input('Adress', sql.NVarChar(200), Adress);
        if (Name_Sector !== undefined) request.input('Name_Sector', sql.NVarChar(200), Name_Sector);
        if (Date_Time !== undefined) request.input('Date_Time', sql.DateTime, Date_Time);
        if (BINPhoto !== null) request.input('BINPhoto', sql.VarBinary(sql.MAX), BINPhoto);

        const result = await request.execute('sp_Report_Update');
        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        next(err);
    }
}

// PATCH /api/reports/:id/urgency
export async function updateUrgency(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const urgency = String(req.body?.Urgency || '').trim();
        if (!urgency) {
            return res.status(400).json({ message: 'Urgency es requerida' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Report_ID', sql.Int, id)
            .input('Urgency', sql.NVarChar(200), urgency)
            .execute('sp_Report_UpdateUrgency');

        const row = result.recordset?.[0];
        if (!row || !row.Ok) {
            return res.status(400).json({ message: 'Urgencia inválida o reporte no encontrado' });
        }

        res.json({ Report_ID: row.Report_ID, Urgency: row.Urgency });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/reports/:id
export async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Report_ID', sql.Int, id)
            .execute('sp_Report_Delete');

        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
}   
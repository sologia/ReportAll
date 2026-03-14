import { poolPromise, sql } from '../config/db.js';
import wellknown from 'wellknown';

// helper: parse si viene JSON string
function tryParseJSON(input) {
    if (!input) return null;
    if (typeof input === 'object') return input;
    try {
        return JSON.parse(input);
    } catch {
        return input; // puede ser WKT string
    }
}

// GET /api/reports
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`EXEC sp_SelectReport`);
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/options
export async function getOptions(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                r.Report_ID,
                r.Adress,
                p.Name_Problem,
                cpr.Urgency,
                cs.Name_Sector AS District
            FROM Reports r
            LEFT JOIN Cat_Problems p ON r.Problem_ID = p.Problem_ID
            LEFT JOIN Cat_ProblemLevels cpr ON r.ProblemLevel_ID = cpr.ProblemLevel_ID
            LEFT JOIN Cat_Sectors cs ON r.Sector_ID = cs.Sector_ID
            ORDER BY r.Report_ID DESC
        `);
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

        const whereParts = [];

        if (dateFrom) {
            whereParts.push('CAST(d.Date_time AS date) >= @dateFrom');
            request.input('dateFrom', sql.Date, dateFrom);
        }

        if (dateTo) {
            whereParts.push('CAST(d.Date_time AS date) <= @dateTo');
            request.input('dateTo', sql.Date, dateTo);
        }

        if (date) {
            whereParts.push('CAST(d.Date_time AS date) = @date');
            request.input('date', sql.Date, date);
        }

        if (state) {
            whereParts.push('ISNULL(st.StateAs, \'Sin estado\') = @state');
            request.input('state', sql.NVarChar(100), state);
        }

        if (district) {
            whereParts.push('cs.Name_Sector = @district');
            request.input('district', sql.NVarChar(200), district);
        }

        if (sector) {
            whereParts.push('cs.Name_Sector = @sector');
            request.input('sector', sql.NVarChar(200), sector);
        }

        const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

        const query = `
            SELECT
                r.Report_ID,
                p.Name_Problem,
                cpr.Urgency,
                r.Adress,
                cs.Name_Sector AS Sector,
                cs.Name_Sector AS District,
                CAST(d.Date_time AS date) AS Report_Date,
                ISNULL(st.StateAs, 'Sin estado') AS State
            FROM Reports r
            LEFT JOIN Cat_Problems p ON r.Problem_ID = p.Problem_ID
            LEFT JOIN Cat_ProblemLevels cpr ON r.ProblemLevel_ID = cpr.ProblemLevel_ID
            LEFT JOIN Cat_Sectors cs ON r.Sector_ID = cs.Sector_ID
            LEFT JOIN Clients_Reports cr ON cr.Report_ID = r.Report_ID
            LEFT JOIN Dates d ON d.Date_ID = cr.Date_ID
            OUTER APPLY (
                SELECT TOP 1 a.State_ID
                FROM Assigments a
                WHERE a.Report_ID = r.Report_ID
                ORDER BY a.Assigment_ID DESC
            ) la
            LEFT JOIN Cat_States st ON st.State_ID = la.State_ID
            ${whereClause}
            ORDER BY r.Report_ID DESC
        `;

        const result = await request.query(query);
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

        const metadataResult = await pool.request().query(`
            SELECT
                t.name AS TableName,
                c.name AS ColumnName
            FROM sys.tables t
            INNER JOIN sys.columns c ON c.object_id = t.object_id
            WHERE t.name IN ('Reports', 'GeoProblems')
        `);

        const reportColumns = new Set(
            metadataResult.recordset
                .filter(row => row.TableName === 'Reports')
                .map(row => row.ColumnName),
        );

        const geoColumns = new Set(
            metadataResult.recordset
                .filter(row => row.TableName === 'GeoProblems')
                .map(row => row.ColumnName),
        );

        const geoKeyCandidates = [
            ['GeoProblem_ID', 'GeoProblem_ID'],
            ['GeoM_ID', 'GeoM_ID'],
            ['Geo_ID', 'Geo_ID'],
            ['Report_ID', 'Report_ID'],
            ['GeoProblemID', 'GeoProblem_ID'],
            ['GeoProblem_ID', 'GeoProblemID'],
        ];

        const geoJoinPair = geoKeyCandidates.find(([reportKey, geoKey]) => (
            reportColumns.has(reportKey) && geoColumns.has(geoKey)
        ));

        const hasGeoJoin = Boolean(geoJoinPair);
        const geoJoinClause = hasGeoJoin
            ? `LEFT JOIN GeoProblems gp ON gp.${geoJoinPair[1]} = r.${geoJoinPair[0]}`
            : '';

        const latCandidates = [];
        const lngCandidates = [];

        if (hasGeoJoin && geoColumns.has('CoordY')) latCandidates.push('TRY_CONVERT(float, gp.CoordY)');
        if (hasGeoJoin && geoColumns.has('CoordX')) lngCandidates.push('TRY_CONVERT(float, gp.CoordX)');

        if (hasGeoJoin && geoColumns.has('GeoM')) {
            latCandidates.push('TRY_CONVERT(float, gp.GeoM.STY)');
            lngCandidates.push('TRY_CONVERT(float, gp.GeoM.STX)');
        }

        if (reportColumns.has('Y')) latCandidates.push('TRY_CONVERT(float, r.Y)');
        if (reportColumns.has('X')) lngCandidates.push('TRY_CONVERT(float, r.X)');

        if (reportColumns.has('CoordY')) latCandidates.push('TRY_CONVERT(float, r.CoordY)');
        if (reportColumns.has('CoordX')) lngCandidates.push('TRY_CONVERT(float, r.CoordX)');

        if (reportColumns.has('GeoM')) {
            latCandidates.push('TRY_CONVERT(float, r.GeoM.STY)');
            lngCandidates.push('TRY_CONVERT(float, r.GeoM.STX)');
        }

        const latExpr = latCandidates.length ? `COALESCE(${latCandidates.join(', ')})` : 'NULL';
        const lngExpr = lngCandidates.length ? `COALESCE(${lngCandidates.join(', ')})` : 'NULL';

        const whereParts = [
            `${latExpr} IS NOT NULL`,
            `${lngExpr} IS NOT NULL`,
        ];

        if (dateFrom) {
            whereParts.push('CAST(d.Date_time AS date) >= @dateFrom');
            request.input('dateFrom', sql.Date, dateFrom);
        }

        if (dateTo) {
            whereParts.push('CAST(d.Date_time AS date) <= @dateTo');
            request.input('dateTo', sql.Date, dateTo);
        }

        if (date) {
            whereParts.push('CAST(d.Date_time AS date) = @date');
            request.input('date', sql.Date, date);
        }

        if (state) {
            whereParts.push('ISNULL(st.StateAs, \'Sin estado\') = @state');
            request.input('state', sql.NVarChar(100), state);
        }

        if (district) {
            whereParts.push('cs.Name_Sector = @district');
            request.input('district', sql.NVarChar(200), district);
        }

        if (sector) {
            whereParts.push('cs.Name_Sector = @sector');
            request.input('sector', sql.NVarChar(200), sector);
        }

        const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

        const query = `
            SELECT
                r.Report_ID,
                p.Name_Problem,
                cpr.Urgency,
                r.Adress,
                cs.Name_Sector AS District,
                CAST(d.Date_time AS date) AS Report_Date,
                ISNULL(st.StateAs, 'Sin estado') AS State,
                ${lngExpr} AS X,
                ${latExpr} AS Y,
                c.Num_Crew,
                lc.Name_Leader
            FROM Reports r
            LEFT JOIN Cat_Problems p ON r.Problem_ID = p.Problem_ID
            LEFT JOIN Cat_ProblemLevels cpr ON r.ProblemLevel_ID = cpr.ProblemLevel_ID
            LEFT JOIN Cat_Sectors cs ON r.Sector_ID = cs.Sector_ID
            ${geoJoinClause}
            LEFT JOIN Clients_Reports cr ON cr.Report_ID = r.Report_ID
            LEFT JOIN Dates d ON d.Date_ID = cr.Date_ID
            OUTER APPLY (
                SELECT TOP 1 a.Assigment_ID, a.State_ID, a.Crew_ID, a.Leader_Crew_ID
                FROM Assigments a
                WHERE a.Report_ID = r.Report_ID
                ORDER BY a.Assigment_ID DESC
            ) la
            LEFT JOIN Cat_States st ON st.State_ID = la.State_ID
            LEFT JOIN Crews c ON c.Crew_ID = la.Crew_ID
            LEFT JOIN Leader_Crews lc ON lc.Leader_Crew_ID = la.Leader_Crew_ID
            ${whereClause}
            ORDER BY r.Report_ID DESC
        `;

        const result = await request.query(query);
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

        const reportWhereParts = [];
        const crewWhereParts = ['a.Report_ID IS NOT NULL'];

        const bindFilterInputs = (queryRequest) => {
            if (dateFrom) {
                queryRequest.input('dateFrom', sql.Date, dateFrom);
            }

            if (dateTo) {
                queryRequest.input('dateTo', sql.Date, dateTo);
            }

            if (district) {
                queryRequest.input('district', sql.NVarChar(200), district);
            }
        };

        if (dateFrom) {
            reportWhereParts.push('CAST(d.Date_time AS date) >= @dateFrom');
            crewWhereParts.push('CAST(da.Date_time AS date) >= @dateFrom');
        }

        if (dateTo) {
            reportWhereParts.push('CAST(d.Date_time AS date) <= @dateTo');
            crewWhereParts.push('CAST(da.Date_time AS date) <= @dateTo');
        }

        if (district) {
            reportWhereParts.push('rs.Name_Sector = @district');
            crewWhereParts.push('s.Name_Sector = @district');
        }

        const reportWhereClause = reportWhereParts.length ? `WHERE ${reportWhereParts.join(' AND ')}` : '';
        const crewWhereClause = crewWhereParts.length ? `WHERE ${crewWhereParts.join(' AND ')}` : '';

        const reportRequest = pool.request();
        bindFilterInputs(reportRequest);

        const reportStatsResult = await reportRequest.query(`
            WITH LatestAssignment AS (
                SELECT
                    a.Report_ID,
                    a.State_ID,
                    ROW_NUMBER() OVER (PARTITION BY a.Report_ID ORDER BY a.Assigment_ID DESC) AS rn
                FROM Assigments a
                WHERE a.Report_ID IS NOT NULL
            )
            SELECT
                r.Report_ID,
                ISNULL(st.StateAs, 'Sin estado') AS State,
                ISNULL(cpl.Urgency, 'Sin urgencia') AS Urgency,
                ISNULL(rs.Name_Sector, 'Sin distrito') AS District,
                ISNULL(p.Name_Problem, 'Sin problema') AS Problem,
                CASE WHEN la.Report_ID IS NULL THEN 0 ELSE 1 END AS IsAssigned,
                CASE
                    WHEN LOWER(ISNULL(st.StateAs, '')) LIKE '%terminad%'
                      OR LOWER(ISNULL(st.StateAs, '')) LIKE '%resuelt%'
                      OR LOWER(ISNULL(st.StateAs, '')) LIKE '%complet%'
                    THEN 1
                    ELSE 0
                END AS IsSolved
            FROM Reports r
            LEFT JOIN Cat_Problems p ON p.Problem_ID = r.Problem_ID
            LEFT JOIN Cat_ProblemLevels cpl ON cpl.ProblemLevel_ID = r.ProblemLevel_ID
            LEFT JOIN Cat_Sectors rs ON rs.Sector_ID = r.Sector_ID
            LEFT JOIN Clients_Reports cr ON cr.Report_ID = r.Report_ID
            LEFT JOIN Dates d ON d.Date_ID = cr.Date_ID
            LEFT JOIN LatestAssignment la ON la.Report_ID = r.Report_ID AND la.rn = 1
            LEFT JOIN Cat_States st ON st.State_ID = la.State_ID
            ${reportWhereClause}
        `);

        const crewRequest = pool.request();
        bindFilterInputs(crewRequest);

        const crewStatsResult = await crewRequest.query(`
            WITH LatestCrewAssignment AS (
                SELECT
                    a.Crew_ID,
                    a.Report_ID,
                    a.State_ID,
                    ROW_NUMBER() OVER (
                        PARTITION BY a.Crew_ID, a.Report_ID
                        ORDER BY a.Assigment_ID DESC
                    ) AS rn
                FROM Assigments a
                LEFT JOIN Dates da ON da.Date_ID = a.Date_ID
                LEFT JOIN Reports r ON r.Report_ID = a.Report_ID
                LEFT JOIN Cat_Sectors s ON s.Sector_ID = r.Sector_ID
                ${crewWhereClause}
            )
            SELECT
                c.Crew_ID,
                c.Num_Crew,
                ISNULL(cs.Name_Sector, 'Sin distrito') AS District,
                COUNT(lca.Report_ID) AS Assigned_Total,
                SUM(
                    CASE
                        WHEN LOWER(ISNULL(st.StateAs, '')) LIKE '%terminad%'
                          OR LOWER(ISNULL(st.StateAs, '')) LIKE '%resuelt%'
                          OR LOWER(ISNULL(st.StateAs, '')) LIKE '%complet%'
                        THEN 1
                        ELSE 0
                    END
                ) AS Solved_Total
            FROM Crews c
            LEFT JOIN Cat_Sectors cs ON cs.Sector_ID = c.Sector_ID
            LEFT JOIN LatestCrewAssignment lca ON lca.Crew_ID = c.Crew_ID AND lca.rn = 1
            LEFT JOIN Cat_States st ON st.State_ID = lca.State_ID
            GROUP BY c.Crew_ID, c.Num_Crew, cs.Name_Sector
            ORDER BY COUNT(lca.Report_ID) DESC, c.Num_Crew ASC
        `);

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
            .input('clientId', sql.Int, clientId)
            .query(`
                SELECT
                    r.Report_ID,
                    p.Name_Problem,
                    cpr.Urgency,
                    r.Adress,
                    cs.Name_Sector AS District,
                    CAST(d.Date_time AS date) AS Report_Date,
                    ISNULL(st.StateAs, 'Sin estado') AS State
                FROM Clients_Reports cr
                INNER JOIN Reports r ON r.Report_ID = cr.Report_ID
                LEFT JOIN Cat_Problems p ON p.Problem_ID = r.Problem_ID
                LEFT JOIN Cat_ProblemLevels cpr ON cpr.ProblemLevel_ID = r.ProblemLevel_ID
                LEFT JOIN Cat_Sectors cs ON cs.Sector_ID = r.Sector_ID
                LEFT JOIN Dates d ON d.Date_ID = cr.Date_ID
                OUTER APPLY (
                    SELECT TOP 1 a.State_ID
                    FROM Assigments a
                    WHERE a.Report_ID = r.Report_ID
                    ORDER BY a.Assigment_ID DESC
                ) la
                LEFT JOIN Cat_States st ON st.State_ID = la.State_ID
                WHERE cr.Client_ID = @clientId
                ORDER BY cr.Client_Report_ID DESC
            `);

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
            .query(`EXEC sp_SelectReportByID @id`);
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

      
       
        const query = `
    
            EXEC sp_InsertReport @Name_Problem, @Urgency, @X, @Y, @BINPhoto, @Adress, @Name_Sector, @Date_Time, @ClientID;
        `;

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

        const result = await request.query(query);
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
        const { Name_Problem, Urgency, GeoM, Adress, Name_Sector, Date_Time } = req.body;

        const pool = await poolPromise;
        let setParts = [];
        let setDate = [];
        const request = pool.request().input('id', sql.Int, id);

        if (Name_Problem !== undefined) {
            setParts.push('Problem_ID =(Select 1 Problem_ID from Cat_Problems where Name_Problem = @Name_Problem), ');
            request.input('Name_Problem', sql.NVarChar(100), Name_Problem);
        }
        if (Urgency !== undefined) {
            setParts.push('ProblemLevel_ID = select 1 ProblemLevel_ID from Cat_ProblemLevels where Urgency = @Urgency), ');
            request.input('Urgency', sql.NVarChar(200), Urgency);
        }
  /*      if (GeoM !== undefined) {
            const parsed = tryParseJSON(GeoM);
            let geomWkt = null;
            if (parsed) {
                if (typeof parsed === 'string') geomWkt = parsed;
                else geomWkt = wellknown.stringify(parsed.type ? parsed : parsed.geometry || parsed);
            }
            request.input('GeoM_WKT', sql.NVarChar(sql.MAX), geomWkt);
            setParts.push('GeoM = CASE WHEN @GeoM_WKT IS NOT NULL AND LEN(@GeoM_WKT) > 0 THEN geometry::STGeomFromText(@GeoM_WKT, 4326) ELSE GeoM END');
        }
            */
        if (BINPhoto !== null) {
            request.input('BINPhoto', sql.VarBinary(sql.MAX), BINPhoto);
        }
        if (Adress !== undefined) {
            setParts.push('Adress = @Adress, ');
            request.input('Adress', sql.NVarChar(200), Adress);
        }
        if (Name_Sector !== undefined) {
            setParts.push('Sector_ID = Select 1 Sector_ID from Cat_Sectors where Name_Sector = @Name_Sector)');
            request.input('Name_Sector', sql.NVarChar(200), Name_Sector);
        }
        if (Date_Time !== undefined) {
            setDate.push('Date_Time = @Date_Time');
            request.input('Date_Time', sql.DateTime, Date_Time);
        }

        if (setParts.length === 0) return res.status(400).json({ message: 'No updatable fields provided' });

        const setClause = setParts.join(', ');
        const sqlQuery = `
            
        insert into Cat_Photos (BINPhoto) values (@BINPhoto)
        declare @IDPhoto int
        set @IDPhoto = SCOPE_IDENTITY();

            UPDATE Reports
            SET ${setClause}, Photo_ID = @IDPhoto
            WHERE Report_ID = @id;

            UPDATE Clients_Reports
            SET ${setDate}
            WHERE Report_ID = @id;
          
        `;

        const result = await request.query(sqlQuery);
        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/reports/:id
export async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Reports WHERE Report_ID = @id');
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}   
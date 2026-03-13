import { poolPromise, sql } from '../config/db.js';

// GET /api/crews
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('exec SelectCrews');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/crews/reports-summary?district=...&order=desc|asc
export async function getReportsSummary(req, res, next) {
    try {
        const { district, order, dateFrom, dateTo } = req.query;
        const pool = await poolPromise;
        const request = pool.request();

        const whereParts = [];
        if (district) {
            whereParts.push('cs.Name_Sector = @district');
            request.input('district', sql.NVarChar(200), district);
        }

        if (dateFrom) {
            whereParts.push('CAST(da.Date_time AS date) >= @dateFrom');
            request.input('dateFrom', sql.Date, dateFrom);
        }

        if (dateTo) {
            whereParts.push('CAST(da.Date_time AS date) <= @dateTo');
            request.input('dateTo', sql.Date, dateTo);
        }

        const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
        const orderDirection = String(order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const query = `
            SELECT
                c.Crew_ID,
                c.Num_Crew,
                cs.Name_Sector AS District,
                COUNT(a.Report_ID) AS Reports_Attended
            FROM Crews c
            LEFT JOIN Cat_Sectors cs ON c.Sector_ID = cs.Sector_ID
            LEFT JOIN Assigments a ON a.Crew_ID = c.Crew_ID AND a.Report_ID IS NOT NULL
            LEFT JOIN Dates da ON da.Date_ID = a.Date_ID
            ${whereClause}
            GROUP BY c.Crew_ID, c.Num_Crew, cs.Name_Sector
            ORDER BY COUNT(a.Report_ID) ${orderDirection}, c.Num_Crew ASC
        `;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/crews/:id/reports
export async function getReportsByCrew(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT
                    a.Assigment_ID,
                    r.Report_ID,
                    p.Name_Problem,
                    cpr.Urgency,
                    r.Adress,
                    cs.Name_Sector AS District,
                    ds.Date_time AS Assignment_Date,
                    st.StateAs AS State
                FROM Assigments a
                INNER JOIN Reports r ON r.Report_ID = a.Report_ID
                LEFT JOIN Cat_Problems p ON p.Problem_ID = r.Problem_ID
                LEFT JOIN Cat_ProblemLevels cpr ON cpr.ProblemLevel_ID = r.ProblemLevel_ID
                LEFT JOIN Cat_Sectors cs ON cs.Sector_ID = r.Sector_ID
                LEFT JOIN Dates ds ON ds.Date_ID = a.Date_ID
                LEFT JOIN Cat_States st ON st.State_ID = a.State_ID
                WHERE a.Crew_ID = @id
                ORDER BY a.Assigment_ID DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/crews/:id
export async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('EXEC sp_SelectCrewByID @id');
        const row = result.recordset[0];
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
}

// POST /api/crews
export async function create(req, res, next) {
    try {
        const { Availability, Sector, Plate, Num_Crew } = req.body;
        const pool = await poolPromise;

        const request = pool.request()
            .input('Availability', sql.NVarChar(250), Availability)
            .input('Sector', sql.NVarChar(250), Sector)
            .input('Plate', sql.NVarChar(20), Plate)
            .input('Num_Crew', sql.Int, Num_Crew);

        const result = await request.query('EXEC sp_InsertCrew @Availability, @Sector, @Plate, @Num_Crew');
        res.status(201).json(result.recordset && result.recordset[0] ? result.recordset[0] : {});
    } catch (err) {
        next(err);
    }
}

// PUT /api/crews/:id
export async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const { Availability, Sector, Plate, Num_Crew } = req.body;
      

        const pool = await poolPromise;
        const request = pool.request().input('id', sql.Int, id);

        let setParts = [];
        if (Num_Crew !== undefined) {
            setParts.push('Num_Crew = @Num_Crew');
            request.input('Num_Crew', sql.Int, Num_Crew);
        }
        if (Availability !== undefined) {
            setParts.push('Availability_Crew_ID = (SELECT Availability_Crew_ID FROM Cat_Availabilitys_Crews WHERE Availability_Crew = @Availability)');
            request.input('Availability', sql.NVarChar(250), Availability);
        }
        if (Sector !== undefined) {
            setParts.push('Sector_ID = (SELECT Sector_ID FROM Cat_Sectors WHERE Name_Sector = @Sector)');
            request.input('Sector', sql.NVarChar(250), Sector);
        }
        if (Plate !== undefined) {
            setParts.push('Vehicle_ID = (SELECT Vehicle_ID FROM Cat_Vehicles WHERE Plate = @Plate)');
            request.input('Plate', sql.NVarChar(20), Plate);
        }

        if (setParts.length === 0) {
            return res.status(400).json({ message: 'No updatable fields provided' });
        }

        const setClause = setParts.join(', ');
        const sqlQuery = `
            UPDATE Crews
            SET ${setClause}
            WHERE Crew_ID = @id;
        `;

        const result = await request.query(sqlQuery);

        if (result.rowsAffected && result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/crews/:id
export async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Crews WHERE Crew_ID = @id');
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}   
import { poolPromise, sql } from '../config/db.js';

// GET /api/assigments
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                a.Assigment_ID,
                lc.Name_Leader,
                c.Num_Crew,
                a.Report_ID,
                r.Adress AS Report_Adress,
                CONVERT(date, d.Date_time) AS Dates,
                cs.StateAs
            FROM Assigments a
            INNER JOIN Leader_Crews lc ON a.Leader_Crew_ID = lc.Leader_Crew_ID
            INNER JOIN Crews c ON a.Crew_ID = c.Crew_ID
            LEFT JOIN Reports r ON a.Report_ID = r.Report_ID
            INNER JOIN Dates d ON a.Date_ID = d.Date_ID
            INNER JOIN Cat_States cs ON a.State_ID = cs.State_ID
            ORDER BY a.Assigment_ID DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/assigments/:id
export async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT
                    a.Assigment_ID,
                    lc.Name_Leader,
                    c.Num_Crew,
                    a.Report_ID,
                    r.Adress AS Report_Adress,
                    d.Date_time,
                    cs.StateAs
                FROM Assigments a
                INNER JOIN Leader_Crews lc ON a.Leader_Crew_ID = lc.Leader_Crew_ID
                INNER JOIN Crews c ON a.Crew_ID = c.Crew_ID
                LEFT JOIN Reports r ON a.Report_ID = r.Report_ID
                INNER JOIN Dates d ON a.Date_ID = d.Date_ID
                INNER JOIN Cat_States cs ON a.State_ID = cs.State_ID
                WHERE a.Assigment_ID = @id
            `);

        const row = result.recordset[0];
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
}

// POST /api/assigments
export async function create(req, res, next) {
    try {
        const role = String(req.auth?.role || '').trim().toLowerCase();
        const authLeaderCrewId = req.auth?.leaderCrewId || null;
        const { Name_Leader, Num_Crew, Report_ID, Date_Time, StateAs } = req.body;

        if (Num_Crew === undefined || Report_ID === undefined || !Date_Time || !StateAs) {
            return res.status(400).json({ message: 'Num_Crew, Report_ID, Date_Time y StateAs son requeridos' });
        }

        if (role !== 'lider_cuadrilla' && !Name_Leader) {
            return res.status(400).json({ message: 'Name_Leader es requerido para este rol' });
        }

        if (role === 'lider_cuadrilla' && !authLeaderCrewId) {
            return res.status(403).json({ message: 'No autorizado: usuario líder sin leaderCrewId en sesión' });
        }

        const reportId = parseInt(Report_ID, 10);
        if (Number.isNaN(reportId)) {
            return res.status(400).json({ message: 'Report_ID inválido' });
        }

        const pool = await poolPromise;

        const districtValidation = await pool.request()
            .input('Num_Crew', sql.Int, Num_Crew)
            .input('Report_ID', sql.Int, reportId)
            .query(`
                SELECT
                    crewSector.Name_Sector AS Crew_District,
                    reportSector.Name_Sector AS Report_District
                FROM (SELECT TOP 1 Crew_ID, Sector_ID FROM Crews WHERE Num_Crew = @Num_Crew) c
                LEFT JOIN Cat_Sectors crewSector ON crewSector.Sector_ID = c.Sector_ID
                LEFT JOIN Reports r ON r.Report_ID = @Report_ID
                LEFT JOIN Cat_Sectors reportSector ON reportSector.Sector_ID = r.Sector_ID
            `);

        const districtRow = districtValidation.recordset[0];
        if (!districtRow) {
            return res.status(400).json({ message: 'No se pudieron validar los distritos de cuadrilla y reporte' });
        }

        const crewDistrict = districtRow.Crew_District;
        const reportDistrict = districtRow.Report_District;
        if (!crewDistrict || !reportDistrict) {
            return res.status(400).json({ message: 'Cuadrilla o reporte sin distrito definido' });
        }

        if (crewDistrict !== reportDistrict) {
            return res.status(400).json({
                message: 'Solo se permiten asignaciones cuando cuadrilla y reporte pertenecen al mismo distrito',
                crewDistrict,
                reportDistrict,
            });
        }

        const request = pool.request()
            .input('Num_Crew', sql.Int, Num_Crew)
            .input('Report_ID', sql.Int, reportId)
            .input('Date_Time', sql.DateTime, Date_Time)
            .input('StateAs', sql.NVarChar(250), StateAs);

        if (role === 'lider_cuadrilla') {
            request.input('Leader_Crew_ID', sql.Int, authLeaderCrewId);
        } else {
            request.input('Name_Leader', sql.NVarChar(250), Name_Leader);
        }

        const result = await request.query(`
            DECLARE @Date_ID INT;

            SELECT TOP 1 @Date_ID = Date_ID
            FROM Dates
            WHERE Date_time = @Date_Time;

            IF @Date_ID IS NULL
            BEGIN
                INSERT INTO Dates (Date_time) VALUES (@Date_Time);
                SET @Date_ID = SCOPE_IDENTITY();
            END

            INSERT INTO Assigments (Leader_Crew_ID, Crew_ID, Report_ID, Date_ID, State_ID)
            VALUES (
                ${role === 'lider_cuadrilla' ? '@Leader_Crew_ID' : '(SELECT TOP 1 Leader_Crew_ID FROM Leader_Crews WHERE Name_Leader = @Name_Leader)'},
                (SELECT TOP 1 Crew_ID FROM Crews WHERE Num_Crew = @Num_Crew),
                @Report_ID,
                @Date_ID,
                (SELECT TOP 1 State_ID FROM Cat_States WHERE StateAs = @StateAs)
            );

            SELECT SCOPE_IDENTITY() AS Assigment_ID;
        `);

        res.status(201).json(result.recordset[0] || {});
    } catch (err) {
        next(err);
    }
}

// PUT /api/assigments/:id
export async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const role = String(req.auth?.role || '').trim().toLowerCase();
        const authCrewId = req.auth?.crewId || null;
        const { Name_Leader, Num_Crew, Report_ID, Date_Time, StateAs } = req.body;

        if (role === 'cuadrilla') {
            const hasOnlyState = (
                StateAs !== undefined
                && Name_Leader === undefined
                && Num_Crew === undefined
                && Report_ID === undefined
                && Date_Time === undefined
            );

            if (!hasOnlyState) {
                return res.status(403).json({ message: 'La cuadrilla solo puede editar el estado de sus reportes asignados' });
            }

            if (!authCrewId) {
                return res.status(403).json({ message: 'No autorizado: usuario de cuadrilla sin crewId en sesión' });
            }
        }

        const pool = await poolPromise;

        if (role === 'cuadrilla') {
            const ownership = await pool.request()
                .input('id', sql.Int, id)
                .input('crewId', sql.Int, authCrewId)
                .query(`
                    SELECT TOP 1 Assigment_ID
                    FROM Assigments
                    WHERE Assigment_ID = @id AND Crew_ID = @crewId
                `);

            if (!ownership.recordset[0]?.Assigment_ID) {
                return res.status(403).json({ message: 'No autorizado: esta asignación no pertenece a tu cuadrilla' });
            }
        }

        const request = pool.request().input('id', sql.Int, id);

        let setParts = [];

        // Líder
        if (Name_Leader !== undefined) {
            setParts.push('Leader_Crew_ID = (SELECT Leader_Crew_ID FROM Leader_Crews WHERE Name_Leader = @Name_Leader)');
            request.input('Name_Leader', sql.NVarChar(250), Name_Leader);
        }

        // Cuadrilla
        if (Num_Crew !== undefined) {
            setParts.push('Crew_ID = (SELECT Crew_ID FROM Crews WHERE Num_Crew = @Num_Crew)');
            request.input('Num_Crew', sql.Int, Num_Crew);
        }

        // Reporte
        if (Report_ID !== undefined) {
            const reportId = parseInt(Report_ID, 10);
            if (Number.isNaN(reportId)) {
                return res.status(400).json({ message: 'Report_ID inválido' });
            }
            setParts.push('Report_ID = @Report_ID');
            request.input('Report_ID', sql.Int, reportId);
        }

        // Fecha: se inserta nueva y se obtiene el ID
        let newDateId = null;
        if (Date_Time !== undefined) {
            const insertResult = await pool.request()
                .input('Date_Time', sql.DateTime, Date_Time)
                .query(`
                    INSERT INTO Dates (Date_time) VALUES (@Date_Time);
                    SELECT SCOPE_IDENTITY() AS Date_ID;
                `);
            newDateId = insertResult.recordset[0].Date_ID;
            setParts.push('Date_ID = @NewDate_ID');
            request.input('NewDate_ID', sql.Int, newDateId);
        }

        // Estado
        if (StateAs !== undefined) {
            setParts.push('State_ID = (SELECT State_ID FROM Cat_States WHERE StateAs = @StateAs)');
            request.input('StateAs', sql.NVarChar(250), StateAs);
        }

        if (setParts.length === 0) {
            return res.status(400).json({ message: 'No updatable fields provided' });
        }

        const setClause = setParts.join(', ');
        
        const sqlQuery = `
            UPDATE Assigments
            SET ${setClause}
            WHERE Assigment_ID = @id;

            SELECT
                a.Assigment_ID,
                lc.Name_Leader,
                c.Num_Crew,
                a.Report_ID,
                r.Adress AS Report_Adress,
                d.Date_time,
                cs.StateAs
            FROM Assigments a
            INNER JOIN Leader_Crews lc ON a.Leader_Crew_ID = lc.Leader_Crew_ID
            INNER JOIN Crews c ON a.Crew_ID = c.Crew_ID
            LEFT JOIN Reports r ON a.Report_ID = r.Report_ID
            INNER JOIN Dates d ON a.Date_ID = d.Date_ID
            INNER JOIN Cat_States cs ON a.State_ID = cs.State_ID
            WHERE a.Assigment_ID = @id;
        `;

        const result = await request.query(sqlQuery);
        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        const updated = result.recordsets?.[1]?.[0] || null;
        if (updated) return res.json(updated);

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        next(err);
    }
}
// DELETE /api/assigments/:id
export async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Assigments WHERE Assigment_ID = @id');
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}
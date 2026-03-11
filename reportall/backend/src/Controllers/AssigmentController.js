import { poolPromise, sql } from '../config/db.js';

// GET /api/assigments
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('EXEC sp_SelectAssigments');
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
            .query('EXEC sp_SelectAssigmentByID @id');

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
        const { Name_Leader, Num_Crew, Name_Path, Date_Time, StateAs } = req.body;
        const pool = await poolPromise;

        const request = pool.request()
            .input('Name_Leader', sql.NVarChar(250), Name_Leader)
            .input('Num_Crew', sql.Int, Num_Crew)
            .input('Name_Path', sql.NVarChar(250), Name_Path)
            .input('Date_Time', sql.DateTime, Date_Time)
            .input('StateAs', sql.NVarChar(250), StateAs);

        const result = await request.query('EXEC sp_InsertAssigment @Name_Leader, @Num_Crew, @Name_Path, @Date_Time, @StateAs');
        res.status(201).json(result.recordset && result.recordset[0] ? result.recordset[0] : {});
    } catch (err) {
        next(err);
    }
}

// PUT /api/assigments/:id
export async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const { Name_Leader, Num_Crew, Name_Path, Date_Time, StateAs } = req.body;
        const pool = await poolPromise;
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

        // Ruta
        if (Name_Path !== undefined) {
            setParts.push('Path_ID = (SELECT Path_ID FROM Paths WHERE Name_Path = @Name_Path)');
            request.input('Name_Path', sql.NVarChar(250), Name_Path);
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
        `;

        const result = await request.query(sqlQuery);
        const updated = result.recordsets[1] && result.recordsets[1][0];


        res.json(updated);
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
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

        console.log('Consulta SQL:', sqlQuery);
        const result = await request.query(sqlQuery);
        console.log('Resultado:', result);

        if (result.rowsAffected && result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error('Error en update:', err); // ← Esto mostrará el error real en la consola del servidor
        res.status(500).json({ message: err.message }); // ← Devolvemos el mensaje al cliente
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
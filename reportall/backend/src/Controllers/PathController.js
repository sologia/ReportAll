import { poolPromise, sql } from '../config/db.js';

// GET /api/paths
export async function getAll(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('Select Name_Path, Date_time from Paths p JOIN Dates d ON p.Date_ID = d.Date_ID ');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

// GET /api/paths/:id
export async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          Path_ID,
          Name_Path,
          Date_ID,
          CASE WHEN GeoM_Paths IS NULL THEN NULL ELSE GeoM_Paths.STAsText() END AS GeoM_Paths
        FROM Paths
        WHERE Path_ID = @id
      `);

    const row = result.recordset[0];
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

// POST /api/paths
// Body esperado:
// {
//   "Sectors": "Nombre sector",
//   "Fecha": "2026-03-12T00:00:00.000Z",
//   "NamePath": "Ruta 1",
//   "FechaCreada": "2026-03-12T10:00:00.000Z"
// }
export async function create(req, res, next) {
  try {
    const { Sectors, Fecha, NamePath, FechaCreada } = req.body;

    if (!Sectors || !Fecha || !NamePath || !FechaCreada) {
      return res.status(400).json({
        message: 'Sectors, Fecha, NamePath y FechaCreada son requeridos'
      });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('Sectors', sql.VarChar(250), Sectors)
      .input('Fecha', sql.DateTime, Fecha)
      .input('NamePath', sql.VarChar(250), NamePath)
      .input('FechaCreada', sql.DateTime, FechaCreada)
      .query('EXEC Create_Paths @Sectors, @Fecha, @NamePath, @FechaCreada');

    res.status(201).json({ message: 'Path created successfully' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/paths/:id
export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const { Name_Path, Date_ID, GeoM_Paths } = req.body;
    const pool = await poolPromise;
    const request = pool.request().input('id', sql.Int, id);

    const setParts = [];

    if (Name_Path !== undefined) {
      setParts.push('Name_Path = @Name_Path');
      request.input('Name_Path', sql.VarChar(250), Name_Path);
    }

    if (Date_ID !== undefined) {
      setParts.push('Date_ID = @Date_ID');
      request.input('Date_ID', sql.Int, Date_ID);
    }

    if (GeoM_Paths !== undefined) {
      setParts.push('GeoM_Paths = CASE WHEN @GeoM_Paths IS NULL OR LEN(@GeoM_Paths) = 0 THEN NULL ELSE geometry::STGeomFromText(@GeoM_Paths, 4326) END');
      request.input('GeoM_Paths', sql.NVarChar(sql.MAX), GeoM_Paths);
    }

    if (setParts.length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const setClause = setParts.join(', ');
    const result = await request.query(`
      UPDATE Paths
      SET ${setClause}
      WHERE Path_ID = @id
    `);

    if (result.rowsAffected && result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/paths/:id
export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Paths WHERE Path_ID = @id');

    if (result.rowsAffected && result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

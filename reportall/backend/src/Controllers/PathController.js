import { poolPromise, sql } from '../config/db.js';

// GET /api/paths
export async function getAll(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_Path_GetAll');
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
      .input('Path_ID', sql.Int, id)
      .execute('sp_Path_GetById');

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
      .execute('sp_Path_Create');

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
    const request = pool.request().input('Path_ID', sql.Int, id);

    if (Name_Path !== undefined) request.input('Name_Path', sql.VarChar(250), Name_Path);
    if (Date_ID !== undefined) request.input('Date_ID', sql.Int, Date_ID);
    if (GeoM_Paths !== undefined) request.input('GeoM_Paths', sql.NVarChar(sql.MAX), GeoM_Paths);

    if (Name_Path === undefined && Date_ID === undefined && GeoM_Paths === undefined) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const result = await request.execute('sp_Path_Update');

    if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
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
      .input('Path_ID', sql.Int, id)
      .execute('sp_Path_Delete');

    if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

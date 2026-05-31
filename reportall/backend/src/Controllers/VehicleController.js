import { poolPromise, sql } from '../config/db.js';

function normalizePlate(value) {
  return String(value || '').trim().toUpperCase();
}

export async function getAll(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_Vehicle_List');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const plate = normalizePlate(req.body?.Plate);
    if (!plate) {
      return res.status(400).json({ message: 'La matrícula es requerida' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Plate', sql.NVarChar(20), plate)
      .execute('sp_Vehicle_Create');

    res.status(201).json(result.recordset?.[0] || { Plate: plate });
  } catch (err) {
    if (String(err?.message || '').toLowerCase().includes('ya está registrada')) {
      return res.status(409).json({ message: 'La matrícula ya está registrada' });
    }

    next(err);
  }
}
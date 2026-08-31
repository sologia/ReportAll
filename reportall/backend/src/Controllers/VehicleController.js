import { poolPromise, sql } from '../config/db.js';

function normalizePlate(value) {
  return String(value || '').trim().toUpperCase();
}

function parseVehicleId(raw) {
  const value = Number.parseInt(String(raw || ''), 10);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function isValidPlate(plate) {
  return /^[A-Z0-9-]{3,20}$/.test(String(plate || ''));
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
    if (!isValidPlate(plate)) {
      return res.status(400).json({ message: 'La matrícula solo puede contener letras, números o guion (3-20 caracteres)' });
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

export async function update(req, res, next) {
  try {
    const vehicleId = parseVehicleId(req.params?.id);
    if (!vehicleId) {
      return res.status(400).json({ message: 'El ID de vehículo no es válido' });
    }

    const plate = normalizePlate(req.body?.Plate);
    if (!plate) {
      return res.status(400).json({ message: 'La matrícula es requerida' });
    }
    if (!isValidPlate(plate)) {
      return res.status(400).json({ message: 'La matrícula solo puede contener letras, números o guion (3-20 caracteres)' });
    }

    const pool = await poolPromise;
    const updated = await pool.request()
      .input('Vehicle_ID', sql.Int, vehicleId)
      .input('Plate', sql.NVarChar(20), plate)
      .execute('sp_Vehicle_Update');

    return res.json(updated.recordset?.[0] || { Vehicle_ID: vehicleId, Plate: plate });
  } catch (err) {
    const message = String(err?.message || '').toLowerCase();
    if (message.includes('no existe')) {
      return res.status(404).json({ message: 'La matrícula no existe' });
    }
    if (message.includes('ya está registrada')) {
      return res.status(409).json({ message: 'La matrícula ya está registrada' });
    }
    next(err);
  }
}
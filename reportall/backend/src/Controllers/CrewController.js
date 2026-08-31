import crypto from 'crypto';
import { poolPromise, sql } from '../config/db.js';

function hashPassword(password, saltHex) {
    const normalizedPassword = String(password || '');
    return crypto.pbkdf2Sync(normalizedPassword, saltHex, 100000, 64, 'sha512').toString('hex');
}

function generateTemporaryPassword() {
    return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

async function findCrewIdByNumber(pool, numCrew) {
    const result = await pool.request()
        .input('Num_Crew', sql.Int, numCrew)
        .execute('sp_Auth_FindCrewByNumber');

    return result.recordset?.[0]?.Crew_ID || null;
}

async function resolveUniqueCrewEmail(pool, crewId) {
    const candidates = [
        `cuadrilla.${crewId}@reportall.local`,
        `cuadrilla.${crewId}.${Date.now()}@reportall.local`,
    ];

    for (const candidate of candidates) {
        const existingUserResult = await pool.request()
            .input('Email', sql.NVarChar(255), candidate)
            .execute('sp_Auth_GetUserByEmail');

        if (!existingUserResult.recordset?.[0]?.User_ID) {
            return candidate;
        }
    }

    throw new Error('No se pudo generar un correo único para la cuadrilla');
}

// GET /api/crews
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SelectCrews');
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

        if (district) request.input('District', sql.NVarChar(200), district);
        if (order) request.input('Order', sql.NVarChar(4), order);
        if (dateFrom) request.input('DateFrom', sql.Date, dateFrom);
        if (dateTo) request.input('DateTo', sql.Date, dateTo);

        const result = await request.execute('sp_Crew_GetReportsSummary');
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

        const role = String(req.auth?.role || '').trim().toLowerCase();
        const authCrewId = req.auth?.crewId || null;
        if (role === 'cuadrilla' && authCrewId !== id) {
            return res.status(403).json({ message: 'No autorizado para consultar reportes de otra cuadrilla' });
        }

        const { problem, state, date } = req.query;

        const pool = await poolPromise;
        const request = pool.request().input('Crew_ID', sql.Int, id);

        if (problem) request.input('Problem', sql.NVarChar(250), problem);
        if (state) request.input('State', sql.NVarChar(250), state);
        if (date) request.input('Date', sql.Date, date);

        const result = await request.execute('sp_Crew_GetReportsByCrew');

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
            .execute('sp_SelectCrewByID');
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

        const existingCrewId = await findCrewIdByNumber(pool, Num_Crew);
        if (existingCrewId) {
            return res.status(409).json({ message: 'Ya existe una cuadrilla registrada con ese número' });
        }

        const request = pool.request()
            .input('Availability', sql.NVarChar(250), Availability)
            .input('Sector', sql.NVarChar(250), Sector)
            .input('Plate', sql.NVarChar(20), Plate)
            .input('Num_Crew', sql.Int, Num_Crew);

        const result = await request.execute('sp_InsertCrew');
        const createdCrew = result.recordset?.[0] || {};
        const crewId = createdCrew.Crew_ID || await findCrewIdByNumber(pool, Num_Crew);

        if (!crewId) {
            throw new Error('No se pudo identificar la cuadrilla recién creada para generar su acceso');
        }

        const email = await resolveUniqueCrewEmail(pool, crewId);
        const password = generateTemporaryPassword();
        const saltHex = crypto.randomBytes(16).toString('hex');
        const hashHex = hashPassword(password, saltHex);

        await pool.request()
            .input('Email', sql.NVarChar(255), email)
            .input('Password_Hash', sql.NVarChar(256), hashHex)
            .input('Password_Salt', sql.NVarChar(128), saltHex)
            .input('Role', sql.NVarChar(20), 'cuadrilla')
            .input('Display_Name', sql.NVarChar(200), `Cuadrilla ${Num_Crew}`)
            .input('Client_ID', sql.Int, null)
            .input('Leader_Crew_ID', sql.Int, null)
            .input('Crew_ID', sql.Int, crewId)
            .execute('sp_Auth_CreateUser');

        res.status(201).json({
            ...createdCrew,
            access: {
                email,
                password,
                role: 'cuadrilla',
            },
        });
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

        if (Num_Crew !== undefined) {
            const existingCrewId = await findCrewIdByNumber(pool, Num_Crew);
            if (existingCrewId && existingCrewId !== id) {
                return res.status(409).json({ message: 'Ya existe otra cuadrilla registrada con ese número' });
            }
        }

        const request = pool.request()
            .input('Crew_ID', sql.Int, id);

        if (Num_Crew !== undefined) request.input('Num_Crew', sql.Int, Num_Crew);
        if (Availability !== undefined) request.input('Availability', sql.NVarChar(250), Availability);
        if (Sector !== undefined) request.input('Sector', sql.NVarChar(250), Sector);
        if (Plate !== undefined) request.input('Plate', sql.NVarChar(20), Plate);

        if (Num_Crew === undefined && Availability === undefined && Sector === undefined && Plate === undefined) {
            return res.status(400).json({ message: 'No updatable fields provided' });
        }

        const result = await request.execute('sp_Crew_Update');

        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
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
        const result = await pool.request()
            .input('Crew_ID', sql.Int, id)
            .execute('sp_Crew_Delete');

        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
}   
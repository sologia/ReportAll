import { poolPromise, sql } from '../config/db.js';

// GET /api/assigments
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_Assignment_GetAll');
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
            .input('Assigment_ID', sql.Int, id)
            .execute('sp_Assignment_GetById');

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
            .execute('sp_Assignment_ValidateDistrict');

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

        const result = await request.execute('sp_Assignment_Create');

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
                .input('Assigment_ID', sql.Int, id)
                .input('Crew_ID', sql.Int, authCrewId)
                .execute('sp_Assignment_OwnershipCheck');

            if (!ownership.recordset[0]?.Assigment_ID) {
                return res.status(403).json({ message: 'No autorizado: esta asignación no pertenece a tu cuadrilla' });
            }
        }

        const request = pool.request().input('Assigment_ID', sql.Int, id);

        if (Name_Leader !== undefined) {
            request.input('Name_Leader', sql.NVarChar(250), Name_Leader);
        }

        if (Num_Crew !== undefined) {
            request.input('Num_Crew', sql.Int, Num_Crew);
        }

        if (Report_ID !== undefined) {
            const reportId = parseInt(Report_ID, 10);
            if (Number.isNaN(reportId)) {
                return res.status(400).json({ message: 'Report_ID inválido' });
            }
            request.input('Report_ID', sql.Int, reportId);
        }

        if (Date_Time !== undefined) {
            request.input('Date_Time', sql.DateTime, Date_Time);
        }

        if (StateAs !== undefined) {
            request.input('StateAs', sql.NVarChar(250), StateAs);
        }

        if (
            Name_Leader === undefined
            && Num_Crew === undefined
            && Report_ID === undefined
            && Date_Time === undefined
            && StateAs === undefined
        ) {
            return res.status(400).json({ message: 'No updatable fields provided' });
        }

        const result = await request.execute('sp_Assignment_Update');
        const affected = result.recordsets?.[0]?.[0]?.RowsAffected ?? 0;
        if (affected === 0) {
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
        const result = await pool.request()
            .input('Assigment_ID', sql.Int, id)
            .execute('sp_Assignment_Delete');

        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
}
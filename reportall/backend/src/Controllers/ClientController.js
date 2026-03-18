import { poolPromise, sql } from '../config/db.js';

// GET /api/clients
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_Client_GetAll');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/clients/:id
export async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Client_ID', sql.Int, id)
            .execute('sp_Client_GetById');

        const row = result.recordset[0];
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
}

// POST /api/clients
export async function create(req, res, next) {
    try {
        const { FirstName, SecondName, FirstLastName, SecondLastName, Numero_NIC } = req.body;
        const pool = await poolPromise;

        const request = pool.request()
            .input('FirstName', sql.NVarChar(100), FirstName)
            .input('SecondName', sql.NVarChar(100), SecondName)
            .input('FirstLastName', sql.NVarChar(100), FirstLastName)
            .input('SecondLastName', sql.NVarChar(100), SecondLastName)
            .input('Numero_NIC', sql.NVarChar(50), Numero_NIC);

        const result = await request.execute('sp_Client_Create');
        res.status(201).json(result.recordset && result.recordset[0] ? result.recordset[0] : {});
    } catch (err) {
        next(err);
    }
}

// PUT /api/clients/:id
export async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const { FirstName, SecondName, FirstLastName, SecondLastName, Numero_NIC } = req.body;
        const pool = await poolPromise;
        const request = pool.request()
            .input('Client_ID', sql.Int, id);

        if (FirstName !== undefined) request.input('FirstName', sql.NVarChar(100), FirstName);
        if (SecondName !== undefined) request.input('SecondName', sql.NVarChar(100), SecondName);
        if (FirstLastName !== undefined) request.input('FirstLastName', sql.NVarChar(100), FirstLastName);
        if (SecondLastName !== undefined) request.input('SecondLastName', sql.NVarChar(100), SecondLastName);
        if (Numero_NIC !== undefined) request.input('Numero_NIC', sql.NVarChar(50), Numero_NIC);

        if (
            FirstName === undefined
            && SecondName === undefined
            && FirstLastName === undefined
            && SecondLastName === undefined
            && Numero_NIC === undefined
        ) {
            return res.status(400).json({ message: 'No updatable fields provided' });
        }

        const result = await request.execute('sp_Client_Update');
        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/clients/:id
export async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Client_ID', sql.Int, id)
            .execute('sp_Client_Delete');

        if (!result.recordset?.[0] || result.recordset[0].RowsAffected === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
}
import { poolPromise, sql } from '../config/db.js';
import wellknown from 'wellknown';

// helper: parse si viene JSON string
function tryParseJSON(input) {
    if (!input) return null;
    if (typeof input === 'object') return input;
    try {
        return JSON.parse(input);
    } catch {
        return input; // puede ser WKT string
    }
}

// GET /api/reports
export async function getAll(req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`EXEC sp_SelectReport`);
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/:id
export async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`EXEC sp_SelectReportByID @id`);
        const row = result.recordset[0];
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
}

// POST /api/reports
export async function create(req, res, next) {
    try {
        const { Name_Problem, Urgency, GeoM, Adress, Name_Sector, Date_Time, ClientID } = req.body;
        const pool = await poolPromise;
        const BINPhoto = req.file ? req.file.buffer : null;

        // GeoM puede ser GeoJSON (objeto o string) o WKT string
        let geomWkt = null;
        const parsed = tryParseJSON(GeoM);
        if (parsed) {
            if (typeof parsed === 'string') {
                geomWkt = parsed;
            } else {
                geomWkt = wellknown.stringify(parsed.type ? parsed : parsed.geometry || parsed);
            }
        }

        const query = `
            DECLARE @g geometry = NULL;
            IF @GeoM_WKT IS NOT NULL AND LEN(@GeoM_WKT) > 0
                SET @g = geometry::STGeomFromText(@GeoM_WKT, 4326);

            EXEC sp_InsertReport @Name_Problem, @Urgency, @g, @BINPhoto, @Adress, @Name_Sector, @Date_Time, @ClientID;
        `;

        const request = pool.request()
            .input('Name_Problem', sql.NVarChar(100), Name_Problem)
            .input('Urgency', sql.NVarChar(200), Urgency)
            .input('GeoM_WKT', sql.NVarChar(sql.MAX), geomWkt)
            .input('BINPhoto', sql.VarBinary(sql.MAX), BINPhoto)
            .input('Adress', sql.NVarChar(200), Adress)
            .input('Name_Sector', sql.NVarChar(200), Name_Sector)
            .input('Date_Time', sql.DateTime, Date_Time)
            .input('ClientID', sql.Int, ClientID);

        const result = await request.query(query);
        res.status(201).json(result.recordset && result.recordset[0] ? result.recordset[0] : {});
    } catch (err) {
        next(err);
    }
}

// PUT /api/reports/:id
export async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

        const BINPhoto = req.file ? req.file.buffer : null;
        const { Name_Problem, Urgency, GeoM, Adress, Name_Sector, Date_Time } = req.body;

        const pool = await poolPromise;
        let setParts = [];
        let setDate = [];
        const request = pool.request().input('id', sql.Int, id);

        if (Name_Problem !== undefined) {
            setParts.push('Problem_ID =(Select 1 Problem_ID from Cat_Problems where Name_Problem = @Name_Problem), ');
            request.input('Name_Problem', sql.NVarChar(100), Name_Problem);
        }
        if (Urgency !== undefined) {
            setParts.push('ProblemLevel_ID = select 1 ProblemLevel_ID from Cat_ProblemLevels where Urgency = @Urgency), ');
            request.input('Urgency', sql.NVarChar(200), Urgency);
        }
  /*      if (GeoM !== undefined) {
            const parsed = tryParseJSON(GeoM);
            let geomWkt = null;
            if (parsed) {
                if (typeof parsed === 'string') geomWkt = parsed;
                else geomWkt = wellknown.stringify(parsed.type ? parsed : parsed.geometry || parsed);
            }
            request.input('GeoM_WKT', sql.NVarChar(sql.MAX), geomWkt);
            setParts.push('GeoM = CASE WHEN @GeoM_WKT IS NOT NULL AND LEN(@GeoM_WKT) > 0 THEN geometry::STGeomFromText(@GeoM_WKT, 4326) ELSE GeoM END');
        }
            */
        if (BINPhoto !== null) {
            request.input('BINPhoto', sql.VarBinary(sql.MAX), BINPhoto);
        }
        if (Adress !== undefined) {
            setParts.push('Adress = @Adress, ');
            request.input('Adress', sql.NVarChar(200), Adress);
        }
        if (Name_Sector !== undefined) {
            setParts.push('Sector_ID = Select 1 Sector_ID from Cat_Sectors where Name_Sector = @Name_Sector)');
            request.input('Name_Sector', sql.NVarChar(200), Name_Sector);
        }
        if (Date_Time !== undefined) {
            setDate.push('Date_Time = @Date_Time');
            request.input('Date_Time', sql.DateTime, Date_Time);
        }

        if (setParts.length === 0) return res.status(400).json({ message: 'No updatable fields provided' });

        const setClause = setParts.join(', ');
        const sqlQuery = `
            
        insert into Cat_Photos (BINPhoto) values (@BINPhoto)
        declare @IDPhoto int
        set @IDPhoto = SCOPE_IDENTITY();

            UPDATE Reports
            SET ${setClause}, Photo_ID = @IDPhoto
            WHERE Report_ID = @id;

            UPDATE Clients_Reports
            SET ${setDate}
            WHERE Report_ID = @id;
          
        `;

        const result = await request.query(sqlQuery);
        const updated = result.recordset && result.recordset[0] ? result.recordset[0] : null;
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

// DELETE /api/reports/:id
export async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Reports WHERE Report_ID = @id');
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}   
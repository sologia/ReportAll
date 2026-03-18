import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/crewsonly
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        c.Crew_ID,
        c.Num_Crew,
        cs.Name_Sector AS District,
        COALESCE(au.Display_Name, CONCAT('Cuadrilla ', c.Num_Crew)) AS Crew_Label,
        au.Display_Name AS Representative_Name
      FROM Crews c
      LEFT JOIN Cat_Sectors cs ON cs.Sector_ID = c.Sector_ID
      LEFT JOIN Auth_Users au ON au.Crew_ID = c.Crew_ID AND au.Role = 'cuadrilla' AND au.Is_Active = 1
      ORDER BY c.Num_Crew ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/crewsonly
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        c.Num_Crew,
        cs.Name_Sector AS District
      FROM Crews c
      LEFT JOIN Cat_Sectors cs ON cs.Sector_ID = c.Sector_ID
      ORDER BY c.Num_Crew ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

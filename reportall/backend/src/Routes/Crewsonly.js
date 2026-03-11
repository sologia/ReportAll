import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/crewsonly
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Num_Crew FROM Crews');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

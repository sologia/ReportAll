import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/reportsonly
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Name_Leader FROM Leader_Crews');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

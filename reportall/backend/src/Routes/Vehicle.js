import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/vehicles
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_Vehicle_List');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

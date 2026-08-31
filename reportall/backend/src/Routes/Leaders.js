import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/reportsonly
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_Leader_List');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

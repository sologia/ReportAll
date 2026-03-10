import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/availabilities
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Availability_Crew FROM Cat_Availabilitys_Crews');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;

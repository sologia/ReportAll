import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/problems
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Name_Problem FROM Cat_Problems');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error cargando problemas:', err);
    res.status(500).json({
      message: 'No se pudieron cargar los problemas',
      detail: err?.message || 'Error desconocido'
    });
  }
});

export default router;

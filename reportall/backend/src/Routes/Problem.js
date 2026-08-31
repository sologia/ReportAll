import express from 'express';
import { poolPromise } from '../config/db.js';

const router = express.Router();

// GET /api/problems
router.get('/', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_Problem_List');
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

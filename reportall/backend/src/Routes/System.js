import express from 'express';
import { requireRoles } from '../middlewares/rbac.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'system healthy',
    requestId: req.requestId || null,
  });
});

router.post('/controlled-error', requireRoles(['administrador', 'director_it']), (req, res, next) => {
  const controlledError = new Error('Error controlado TP-07');
  controlledError.status = 500;
  controlledError.code = 'TP07_CONTROLLED_ERROR';
  controlledError.details = {
    testCase: 'TP-07',
    requirement: 'RNF-03',
    source: 'api/system/controlled-error',
  };

  next(controlledError);
});

export default router;

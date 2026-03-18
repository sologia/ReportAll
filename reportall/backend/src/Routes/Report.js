import express from 'express';
import multer from 'multer';
import * as ctrl from '../Controllers/ReportController.js';
import { requireRoles } from '../middlewares/rbac.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/reports
router.get('/', ctrl.getAll);

// GET /api/reports/options
router.get('/options', ctrl.getOptions);

// GET /api/reports/urgencies
router.get('/urgencies', ctrl.getUrgencies);

// GET /api/reports/summary
router.get('/summary', ctrl.getSummary);

// GET /api/reports/summary-map
router.get('/summary-map', ctrl.getSummaryMap);

// GET /api/reports/statistics
router.get('/statistics', ctrl.getStatistics);

// GET /api/reports/client/:clientId
router.get('/client/:clientId', ctrl.getByClient);

// GET /api/reports/:id
router.get('/:id', ctrl.getById);

// PATCH /api/reports/:id/urgency
router.patch('/:id/urgency', requireRoles(['administrador']), ctrl.updateUrgency);

// POST /api/reports  (espera campo de fichero 'BINPhoto' opcional)
router.post('/', upload.single('BINPhoto'), ctrl.create);

// PUT /api/reports/:id  (espera campo de fichero 'BINPhoto' opcional)
router.put('/:id', upload.single('BINPhoto'), ctrl.update);

// DELETE /api/reports/:id
router.delete('/:id', ctrl.remove);

export default router;
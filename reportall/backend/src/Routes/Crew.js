import express from 'express';
import * as CrewController from '../Controllers/CrewController.js';

const router = express.Router();

router.get('/', CrewController.getAll);
router.get('/reports-summary', CrewController.getReportsSummary);
router.get('/:id/reports', CrewController.getReportsByCrew);
router.get('/:id', CrewController.getById);
router.post('/', CrewController.create);
router.put('/:id', CrewController.update);
router.delete('/:id', CrewController.remove);

export default router;
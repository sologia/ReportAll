import express from 'express';
import * as VehicleController from '../Controllers/VehicleController.js';
import { requireRoles } from '../middlewares/rbac.js';

const router = express.Router();

// GET /api/vehicles
router.get('/', VehicleController.getAll);
router.post('/', requireRoles(['administrador', 'director_it', 'lider_cuadrilla']), VehicleController.create);

export default router;

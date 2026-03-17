import express from 'express';
import * as AssigmentController from '../Controllers/AssigmentController.js';
import { requireRoles } from '../middlewares/rbac.js';

const router = express.Router();

router.get('/', AssigmentController.getAll);
router.get('/:id', AssigmentController.getById);
router.post('/', requireRoles(['administrador', 'lider_cuadrilla']), AssigmentController.create);
router.put('/:id', requireRoles(['administrador', 'lider_cuadrilla', 'cuadrilla']), AssigmentController.update);
router.delete('/:id', requireRoles(['administrador', 'lider_cuadrilla']), AssigmentController.remove);

export default router;
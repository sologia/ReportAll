import express from 'express';
import * as PathController from '../Controllers/PathController.js';

const router = express.Router();

// GET /api/paths
router.get('/', PathController.getAll);
router.get('/:id', PathController.getById);
router.post('/', PathController.create);
router.put('/:id', PathController.update);
router.delete('/:id', PathController.remove);

export default router;
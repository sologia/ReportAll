import express from 'express';
import * as AssigmentController from '../Controllers/AssigmentController.js';

const router = express.Router();

router.get('/', AssigmentController.getAll);
router.get('/:id', AssigmentController.getById);
router.post('/', AssigmentController.create);
router.put('/:id', AssigmentController.update);
router.delete('/:id', AssigmentController.remove);

export default router;
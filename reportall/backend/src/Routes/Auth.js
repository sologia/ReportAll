import express from 'express';
import * as AuthController from '../Controllers/AuthController.js';
import { requireRoles } from '../middlewares/rbac.js';

const router = express.Router();

router.get('/crew-accounts', requireRoles(['administrador', 'director_it', 'lider_cuadrilla']), AuthController.listCrewAccounts);
router.post('/crew-accounts/:userId/reset-password', requireRoles(['administrador', 'director_it', 'lider_cuadrilla']), AuthController.resetCrewPassword);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;

/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import { attachAuthContext, requireRoles } from '../middlewares/rbac.js';

describe('requireRoles', () => {
  function makeApp() {
    const app = express();
    app.use(attachAuthContext);
    app.get('/secure', requireRoles(['administrador']), (_req, res) => {
      res.status(200).json({ ok: true });
    });
    return app;
  }

  it('retorna 403 cuando no hay rol', async () => {
    const app = makeApp();
    const response = await request(app).get('/secure');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'No autorizado para esta acción' });
  });

  it('retorna 403 cuando el rol no está permitido', async () => {
    const app = makeApp();
    const response = await request(app)
      .get('/secure')
      .set('x-user-role', 'cliente');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'No autorizado para esta acción' });
  });

  it('permite acceso cuando el rol está permitido', async () => {
    const app = makeApp();
    const response = await request(app)
      .get('/secure')
      .set('x-user-role', 'administrador');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});

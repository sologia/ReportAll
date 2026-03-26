/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import { attachAuthContext } from '../middlewares/rbac.js';

describe('attachAuthContext', () => {
  it('adjunta los datos de auth parseados desde headers', async () => {
    const app = express();

    app.use(attachAuthContext);
    app.get('/probe', (req, res) => {
      res.status(200).json(req.auth);
    });

    const response = await request(app)
      .get('/probe')
      .set('x-user-role', 'Client')
      .set('x-client-id', '12')
      .set('x-leader-crew-id', '7')
      .set('x-crew-id', '31');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      role: 'client',
      clientId: 12,
      leaderCrewId: 7,
      crewId: 31,
    });
  });
});

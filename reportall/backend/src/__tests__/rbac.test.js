/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { attachAuthContext } from '../middlewares/rbac.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

describe('attachAuthContext', () => {
  it('adjunta los datos de auth parseados desde headers legacy', async () => {
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
      userId: null,
      email: '',
      displayName: '',
    });
  });

  it('adjunta los datos de auth parseados desde cookie JWT', async () => {
    const app = express();

    app.use(attachAuthContext);
    app.get('/probe', (req, res) => {
      res.status(200).json(req.auth);
    });

    const token = jwt.sign(
      {
        userId: 5,
        email: 'admin@example.com',
        role: 'administrador',
        displayName: 'Admin',
        clientId: null,
        leaderCrewId: 3,
        crewId: 8,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/probe')
      .set('Cookie', `reportall_auth=${encodeURIComponent(token)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      role: 'administrador',
      clientId: null,
      leaderCrewId: 3,
      crewId: 8,
      userId: 5,
      email: 'admin@example.com',
      displayName: 'Admin',
    });
  });
});

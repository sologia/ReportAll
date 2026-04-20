import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import reportsRouter from './src/Routes/Report.js';
import crewsRouter from './src/Routes/Crew.js';
import clientsRouter from './src/Routes/Client.js';
import assignmentsRouter from './src/Routes/Assigment.js';
import sectorsRouter from './src/Routes/Sector.js';
import problemsRouter from './src/Routes/Problem.js';
import vehiclesRouter from './src/Routes/Vehicle.js';
import availabilityRouter from './src/Routes/Availability.js';
import leadersRouter from './src/Routes/Leaders.js';
import crewsonlyRouter from './src/Routes/Crewsonly.js';
import stateRouter from './src/Routes/stattus.js';
import authRouter from './src/Routes/Auth.js';
import systemRouter from './src/Routes/System.js';
import { attachAuthContext } from './src/middlewares/rbac.js';
import { getRequestContext, logStructured } from './src/config/logger.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// figure out this file's directory; avoids depending on the process cwd
const __dirname = dirname(fileURLToPath(import.meta.url));

// dotenv normally reads ``.env`` from process.cwd();
// we explicitly point it at backend/src/.env so it works whether the
// script is run from the backend folder or the project root.
const envPath = join(__dirname, 'src', '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3001;

const configuredOrigins = String(
  process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://localhost:3002'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests sin origin (Postman/curl) siguen permitidas.
    if (!origin) return callback(null, true);
    if (configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin no permitido'));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  req.requestId = String(req.header('x-request-id') || '').trim() || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);

  const startedAt = Date.now();
  res.on('finish', () => {
    logStructured('info', 'http_request', {
      ...getRequestContext(req),
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachAuthContext);

// Rutas
app.use('/api/reports', reportsRouter);
app.use('/api/crews', crewsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/sectors', sectorsRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/leaders', leadersRouter);
app.use('/api/availabilities', availabilityRouter);
app.use('/api/crewsonly', crewsonlyRouter);
app.use('/api/states', stateRouter);
app.use('/api/auth', authRouter);
app.use('/api/system', systemRouter);

// Manejador de errores estructurado
app.use((err, req, res, next) => {
  const statusCode = Number.isInteger(err?.status) ? err.status : 500;

  logStructured('error', 'request_failed', {
    ...getRequestContext(req),
    statusCode,
    errorName: err?.name || 'Error',
    errorCode: err?.code || null,
    errorMessage: err?.message || 'Internal Server Error',
    errorDetails: err?.details || null,
    stack: err?.stack || null,
  });

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : (err?.message || 'Error'),
    requestId: req.requestId || null,
    code: err?.code || null,
    details: err?.details || null,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
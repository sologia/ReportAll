import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import { attachAuthContext } from './src/middlewares/rbac.js';
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

app.use(cors());
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

// Manejador de errores simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
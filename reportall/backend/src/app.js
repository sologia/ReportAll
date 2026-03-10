import express from 'express';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// CORS simple: permite llamadas desde el frontend (ajusta origen si necesitas seguridad)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // cambiar por tu origen en producción
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

export default app;

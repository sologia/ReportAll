import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config({ path: './reportall/backend/.env' });

export const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  port: 1433, // <-- explícito
  options: {
    encrypt: true, // true si usas Azure
    trustServerCertificate: true,
    connectTimeout: 30000, // 30 segundos
    requestTimeout: 30000,
  },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000 // 30 segundos
  }
};

export const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión a SQL Server', err);
    throw err; // <- esto es crucial
  });
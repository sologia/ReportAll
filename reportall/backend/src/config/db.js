import dotenv from 'dotenv';
dotenv.config();

const DB_AUTH = (process.env.DB_AUTH || 'sql').toLowerCase();

import msnodesqlv8 from 'mssql/msnodesqlv8.js';
let sqlModule;
if (DB_AUTH === 'windows') {
  sqlModule = msnodesqlv8;
} else {
  sqlModule = await import('mssql');
}
const sql = sqlModule.default ?? sqlModule;

const commonOptions = {
  trustServerCertificate: true,
  connectTimeout: 30000,
  requestTimeout: 30000
};

export const sqlConfig = DB_AUTH === 'windows' ? {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    ...commonOptions
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
} : {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    ...commonOptions
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

export const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log(`Conectado a SQL Server (${DB_AUTH === 'windows' ? 'Windows Auth' : 'SQL Auth'})`);
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión a SQL Server', err);
    throw err;
  });

export { sql };
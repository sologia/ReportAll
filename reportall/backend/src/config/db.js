import dotenv from 'dotenv';
dotenv.config();

const DB_AUTH = (process.env.DB_AUTH || 'sql').toLowerCase();

// Cargar el driver adecuado (top-level await, package.json tiene "type":"module")
let sqlModule;
if (DB_AUTH === 'windows') {
  sqlModule = await import('mssql/msnodesqlv8');
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
    encrypt: process.env.DB_ENCRYPT === 'true', // true si usas Azure; por defecto false
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
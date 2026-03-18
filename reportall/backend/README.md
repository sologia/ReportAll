# Backend

Express server for the ReportALL application.

## Configuration

The server reads database connection settings from an environment file.
By default the code in `server.js` loads `backend/src/.env`:

```
DB_AUTH=sql            # or windows
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=ENACAL_Project
DB_USER=sa
DB_PASSWORD=...
PORT=3001
```

You may move the `.env` file to the root of `backend/` and adjust
`dotenv.config()` call in `server.js` accordingly.  Ensure the
`DB_USER`/`DB_PASSWORD` pair are correct to avoid login errors.

## Dependencias del proyecto

Instalación recomendada desde la raíz del proyecto (`reportall`):

```bash
npm install
npm install --prefix backend
```

### Dependencias de la raíz (`reportall/package.json`)

- `@react-leaflet/core`
- `cors`
- `dotenv`
- `leaflet`
- `leaflet-geosearch`
- `msnodesqlv8`
- `next`
- `node`
- `react`
- `react-dom`
- `react-icons`
- `react-leaflet`
- `sweetalert2`
- `wellknown`

Dev dependencies:

- `@tailwindcss/postcss`
- `concurrently`
- `tailwindcss`

### Dependencias del backend (`backend/package.json`)

- `cors`
- `dotenv`
- `express`
- `msnodesqlv8`
- `mssql`
- `multer`
- `node`
- `wellknown`

## Migración de registro y login

Ejecuta en SQL Server el script:

`backend/sql/2026-03-13-auth-users.sql`

Este script crea la tabla `Auth_Users` y sus relaciones:

- `Auth_Users.Client_ID -> Clients.Client_ID`
- `Auth_Users.Leader_Crew_ID -> Leader_Crews.Leader_Crew_ID`

Endpoints habilitados:

- `POST /api/auth/register`
- `POST /api/auth/login`

## Migración de procedimientos almacenados del backend

Ejecuta en SQL Server el script:

`backend/sql/2026-03-17-backend-stored-procedures.sql`

Este script:

- Crea/actualiza procedimientos almacenados para `clients`, `paths`, `crews`, `assigments`, `reports`, `auth` y catálogos.
- Elimina el SP legacy `Create_Paths` (ya no usado por el backend).
- Permite que el backend opere sin queries SQL inline en los controladores/rutas.

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

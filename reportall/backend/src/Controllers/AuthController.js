import crypto from 'crypto';
import { poolPromise, sql } from '../config/db.js';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hashPassword(password, saltHex) {
  const normalizedPassword = String(password || '');
  return crypto.pbkdf2Sync(normalizedPassword, saltHex, 100000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, saltHex, expectedHash) {
  const computed = hashPassword(password, saltHex);
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(expectedHash, 'hex'));
}

async function ensureClient({ FirstName, SecondName, FirstLastName, SecondLastName, Numero_NIC }) {
  const pool = await poolPromise;
  const request = pool.request()
    .input('FirstName', sql.NVarChar(100), FirstName)
    .input('SecondName', sql.NVarChar(100), SecondName)
    .input('FirstLastName', sql.NVarChar(100), FirstLastName)
    .input('SecondLastName', sql.NVarChar(100), SecondLastName)
    .input('Numero_NIC', sql.NVarChar(50), Numero_NIC);

  const existingResult = await request.query(`
    SELECT TOP 1 Client_ID
    FROM Clients
    WHERE Numero_NIC = @Numero_NIC
    ORDER BY Client_ID DESC;
  `);

  if (existingResult.recordset[0]?.Client_ID) {
    return existingResult.recordset[0].Client_ID;
  }

  const createdResult = await request.query(`
    INSERT INTO Clients (FirstName_Client, SecondName_Client, FirstLastName_Client, SecondLastName_Client, Numero_NIC)
    OUTPUT INSERTED.Client_ID
    VALUES (@FirstName, @SecondName, @FirstLastName, @SecondLastName, @Numero_NIC);
  `);

  return createdResult.recordset[0]?.Client_ID;
}

async function ensureWorker(nameLeader) {
  const pool = await poolPromise;
  const request = pool.request().input('Name_Leader', sql.NVarChar(250), nameLeader);

  const existingResult = await request.query(`
    SELECT TOP 1 Leader_Crew_ID
    FROM Leader_Crews
    WHERE Name_Leader = @Name_Leader
    ORDER BY Leader_Crew_ID DESC;
  `);

  if (existingResult.recordset[0]?.Leader_Crew_ID) {
    return existingResult.recordset[0].Leader_Crew_ID;
  }

  const createdResult = await request.query(`
    INSERT INTO Leader_Crews (Name_Leader)
    OUTPUT INSERTED.Leader_Crew_ID
    VALUES (@Name_Leader);
  `);

  return createdResult.recordset[0]?.Leader_Crew_ID;
}

export async function register(req, res, next) {
  try {
    const {
      email,
      password,
      role,
      displayName,
      clientData,
      workerData,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = String(role || '').trim().toLowerCase();
    const finalDisplayName = String(displayName || '').trim();

    if (!normalizedEmail || !password || !normalizedRole || !finalDisplayName) {
      return res.status(400).json({ message: 'email, password, role y displayName son requeridos' });
    }

    if (!['cliente', 'trabajador'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'role debe ser cliente o trabajador' });
    }

    const pool = await poolPromise;
    const existingUserResult = await pool.request()
      .input('Email', sql.NVarChar(255), normalizedEmail)
      .query('SELECT TOP 1 User_ID FROM Auth_Users WHERE Email = @Email;');

    if (existingUserResult.recordset[0]?.User_ID) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    let clientId = null;
    let leaderCrewId = null;

    if (normalizedRole === 'cliente') {
      const payload = {
        FirstName: String(clientData?.FirstName || '').trim(),
        SecondName: String(clientData?.SecondName || '').trim(),
        FirstLastName: String(clientData?.FirstLastName || '').trim(),
        SecondLastName: String(clientData?.SecondLastName || '').trim(),
        Numero_NIC: String(clientData?.Numero_NIC || '').trim(),
      };

      if (!payload.FirstName || !payload.FirstLastName || !payload.Numero_NIC) {
        return res.status(400).json({ message: 'Para clientes, FirstName, FirstLastName y Numero_NIC son requeridos' });
      }

      clientId = await ensureClient(payload);
      if (!clientId) {
        return res.status(500).json({ message: 'No se pudo crear/encontrar el cliente' });
      }
    }

    if (normalizedRole === 'trabajador') {
      const workerName = String(workerData?.Name_Leader || finalDisplayName).trim();
      if (!workerName) {
        return res.status(400).json({ message: 'Para trabajadores, Name_Leader es requerido' });
      }

      leaderCrewId = await ensureWorker(workerName);
      if (!leaderCrewId) {
        return res.status(500).json({ message: 'No se pudo crear/encontrar el trabajador' });
      }
    }

    const saltHex = crypto.randomBytes(16).toString('hex');
    const hashHex = hashPassword(password, saltHex);

    const createdUserResult = await pool.request()
      .input('Email', sql.NVarChar(255), normalizedEmail)
      .input('Password_Hash', sql.NVarChar(256), hashHex)
      .input('Password_Salt', sql.NVarChar(128), saltHex)
      .input('Role', sql.NVarChar(20), normalizedRole)
      .input('Display_Name', sql.NVarChar(200), finalDisplayName)
      .input('Client_ID', sql.Int, clientId)
      .input('Leader_Crew_ID', sql.Int, leaderCrewId)
      .query(`
        INSERT INTO Auth_Users (Email, Password_Hash, Password_Salt, Role, Display_Name, Client_ID, Leader_Crew_ID)
        OUTPUT INSERTED.User_ID, INSERTED.Email, INSERTED.Role, INSERTED.Display_Name, INSERTED.Client_ID, INSERTED.Leader_Crew_ID
        VALUES (@Email, @Password_Hash, @Password_Salt, @Role, @Display_Name, @Client_ID, @Leader_Crew_ID);
      `);

    const created = createdUserResult.recordset[0];
    return res.status(201).json({
      ok: true,
      user: {
        userId: created.User_ID,
        email: created.Email,
        role: created.Role,
        displayName: created.Display_Name,
        clientId: created.Client_ID,
        leaderCrewId: created.Leader_Crew_ID,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'email y password son requeridos' });
    }

    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('Email', sql.NVarChar(255), normalizedEmail)
      .query(`
        SELECT TOP 1
          u.User_ID,
          u.Email,
          u.Password_Hash,
          u.Password_Salt,
          u.Role,
          u.Display_Name,
          u.Client_ID,
          u.Leader_Crew_ID,
          u.Is_Active
        FROM Auth_Users u
        WHERE u.Email = @Email;
      `);

    const user = userResult.recordset[0];
    if (!user || !user.Is_Active) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const valid = verifyPassword(password, user.Password_Salt, user.Password_Hash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json({
      email: user.Email,
      role: user.Role,
      displayName: user.Display_Name,
      clientId: user.Client_ID,
      leaderCrewId: user.Leader_Crew_ID,
    });
  } catch (err) {
    next(err);
  }
}

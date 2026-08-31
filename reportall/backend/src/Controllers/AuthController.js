import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { poolPromise, sql } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'reportall_auth';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_me';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'reportall_refresh';

const activeRefreshTokenByUserId = new Map();

export function parseExpiresToSeconds(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 8 * 60 * 60;

  const exactSeconds = Number.parseInt(normalized, 10);
  if (!Number.isNaN(exactSeconds) && String(exactSeconds) === normalized) {
    return exactSeconds;
  }

  const match = normalized.match(/^(\d+)([smhd])$/);
  if (!match) return 8 * 60 * 60;

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  return amount * 60 * 60 * 24;
}

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: parseExpiresToSeconds(JWT_EXPIRES_IN) * 1000,
  };
}

function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: parseExpiresToSeconds(REFRESH_TOKEN_EXPIRES_IN) * 1000,
  };
}

function buildUserClaims(user) {
  return {
    userId: user.User_ID,
    email: user.Email,
    role: user.Role,
    displayName: user.Display_Name,
    clientId: user.Client_ID,
    leaderCrewId: user.Leader_Crew_ID,
    crewId: user.Crew_ID,
  };
}

function signAccessToken(claims) {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(claims, tokenId) {
  return jwt.sign(
    {
      sub: String(claims.userId),
      email: claims.email,
      role: claims.role,
      tokenId,
      type: 'refresh',
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

function parseCookieValue(req, cookieName) {
  const cookiesHeader = String(req.header('cookie') || '');
  if (!cookiesHeader) return '';

  const parts = cookiesHeader.split(';').map((part) => part.trim());
  for (const part of parts) {
    if (!part) continue;
    const equalsIndex = part.indexOf('=');
    if (equalsIndex < 0) continue;

    const key = part.slice(0, equalsIndex).trim();
    const value = part.slice(equalsIndex + 1).trim();
    if (key !== cookieName) continue;

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return '';
}

function clearAuthCookies(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };

  res.clearCookie(AUTH_COOKIE_NAME, baseCookie);
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookie);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hashPassword(password, saltHex) {
  const normalizedPassword = String(password || '');
  return crypto.pbkdf2Sync(normalizedPassword, saltHex, 100000, 64, 'sha512').toString('hex');
}

function generateTemporaryPassword() {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
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

  const result = await request.execute('sp_Auth_EnsureClient');
  return result.recordset[0]?.Client_ID;
}

async function ensureWorker(nameLeader) {
  const pool = await poolPromise;
  const request = pool.request().input('Name_Leader', sql.NVarChar(250), nameLeader);

  const result = await request.execute('sp_Auth_EnsureLeader');
  return result.recordset[0]?.Leader_Crew_ID;
}

async function findCrewIdByNumber(numCrew) {
  const numericValue = Number.parseInt(String(numCrew || ''), 10);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  const pool = await poolPromise;
  const result = await pool.request()
    .input('Num_Crew', sql.Int, numericValue)
    .execute('sp_Auth_FindCrewByNumber');

  return result.recordset[0]?.Crew_ID || null;
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

    if (!['cliente', 'administrador', 'director_it', 'cuadrilla', 'lider_cuadrilla'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'role inválido para este sistema' });
    }

    const pool = await poolPromise;
    const existingUserResult = await pool.request()
      .input('Email', sql.NVarChar(255), normalizedEmail)
      .execute('sp_Auth_GetUserByEmail');

    if (existingUserResult.recordset[0]?.User_ID) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    let clientId = null;
    let leaderCrewId = null;
    let crewId = null;

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

    if (normalizedRole === 'lider_cuadrilla') {
      const workerName = String(workerData?.Name_Leader || finalDisplayName).trim();
      if (!workerName) {
        return res.status(400).json({ message: 'Para lider_cuadrilla, workerData.Name_Leader es requerido' });
      }

      leaderCrewId = await ensureWorker(workerName);
      if (!leaderCrewId) {
        return res.status(500).json({ message: 'No se pudo crear/encontrar el trabajador' });
      }
    }

    if (normalizedRole === 'cuadrilla') {
      crewId = await findCrewIdByNumber(workerData?.Num_Crew);
      if (!crewId) {
        return res.status(400).json({ message: 'Para cuadrilla, workerData.Num_Crew es requerido y debe existir en Crews' });
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
      .input('Crew_ID', sql.Int, crewId)
      .execute('sp_Auth_CreateUser');

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
        crewId: created.Crew_ID,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listCrewAccounts(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_Auth_GetCrewAccounts');
    res.json(result.recordset || []);
  } catch (err) {
    next(err);
  }
}

export async function resetCrewPassword(req, res, next) {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Identificador de usuario inválido' });
    }

    const password = generateTemporaryPassword();
    const saltHex = crypto.randomBytes(16).toString('hex');
    const hashHex = hashPassword(password, saltHex);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('User_ID', sql.Int, userId)
      .input('Password_Hash', sql.NVarChar(256), hashHex)
      .input('Password_Salt', sql.NVarChar(128), saltHex)
      .execute('sp_Auth_UpdatePassword');

    const updatedUser = result.recordset?.[0];
    if (!updatedUser?.User_ID) {
      return res.status(404).json({ message: 'Cuenta de cuadrilla no encontrada' });
    }

    return res.status(200).json({
      ok: true,
      account: updatedUser,
      password,
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
      .execute('sp_Auth_GetUserByEmail');

    const user = userResult.recordset[0];
    if (!user || !user.Is_Active) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const valid = verifyPassword(password, user.Password_Salt, user.Password_Hash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const claims = buildUserClaims(user);
    const accessToken = signAccessToken(claims);
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = signRefreshToken(claims, refreshTokenId);

    activeRefreshTokenByUserId.set(String(claims.userId), refreshTokenId);

    res.cookie(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions());
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    const isProduction = process.env.NODE_ENV === 'production';
    const shouldExposeToken = process.env.AUTH_EXPOSE_TOKEN === 'true' || !isProduction;

    const payload = {
      tokenType: 'Bearer',
      expiresIn: JWT_EXPIRES_IN,
      refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
      user: claims,
    };

    if (shouldExposeToken) {
      payload.token = accessToken;
    }

    return res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = parseCookieValue(req, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token requerido' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }

    const userId = String(payload?.sub || '').trim();
    const email = normalizeEmail(payload?.email);
    const tokenId = String(payload?.tokenId || '').trim();
    const tokenType = String(payload?.type || '').trim().toLowerCase();

    if (!userId || !email || !tokenId || tokenType !== 'refresh') {
      return res.status(401).json({ message: 'Refresh token inválido' });
    }

    const activeTokenId = activeRefreshTokenByUserId.get(userId);
    if (!activeTokenId || activeTokenId !== tokenId) {
      return res.status(401).json({ message: 'Refresh token revocado o reutilizado' });
    }

    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .execute('sp_Auth_GetUserByEmail');

    const user = userResult.recordset[0];
    if (!user || !user.Is_Active || String(user.User_ID) !== userId) {
      return res.status(401).json({ message: 'Usuario no válido para refresh' });
    }

    const claims = buildUserClaims(user);
    const accessToken = signAccessToken(claims);
    const nextRefreshTokenId = crypto.randomUUID();
    const nextRefreshToken = signRefreshToken(claims, nextRefreshTokenId);

    activeRefreshTokenByUserId.set(userId, nextRefreshTokenId);

    res.cookie(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions());
    res.cookie(REFRESH_COOKIE_NAME, nextRefreshToken, getRefreshCookieOptions());

    const isProduction = process.env.NODE_ENV === 'production';
    const shouldExposeToken = process.env.AUTH_EXPOSE_TOKEN === 'true' || !isProduction;

    const responsePayload = {
      ok: true,
      tokenType: 'Bearer',
      expiresIn: JWT_EXPIRES_IN,
      refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
      refreshRotated: true,
      user: claims,
    };

    if (shouldExposeToken) {
      responsePayload.token = accessToken;
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  const refreshToken = parseCookieValue(req, REFRESH_COOKIE_NAME);
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const userId = String(payload?.sub || '').trim();
      if (userId) {
        activeRefreshTokenByUserId.delete(userId);
      }
    } catch {
      // si el token ya vencio o es invalido, igual limpiamos cookies
    }
  }

  clearAuthCookies(res);

  return res.status(200).json({ ok: true });
}

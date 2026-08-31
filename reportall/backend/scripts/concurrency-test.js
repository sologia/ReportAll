#!/usr/bin/env node

/**
 * Prueba de concurrencia simple para endpoints HTTP.
 *
 * Uso:
 * node scripts/concurrency-test.js --url http://localhost:3001/api/states --users 50 --method GET
 * node scripts/concurrency-test.js --url http://localhost:3001/api/auth/login --users 50 --method POST --body '{"username":"demo","password":"demo"}'
 */

const args = process.argv.slice(2);

function getArgValue(name, defaultValue = undefined) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return defaultValue;
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) return true;
  return value;
}

function parseHeaders(rawHeaders) {
  if (!rawHeaders) return {};
  try {
    const parsed = JSON.parse(rawHeaders);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('headers debe ser un objeto JSON.');
    }
    return parsed;
  } catch (error) {
    throw new Error(`No se pudo parsear --headers: ${error.message}`);
  }
}

function parseBody(rawBody) {
  if (!rawBody) return undefined;
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function toMs(nanoseconds) {
  return Number(nanoseconds) / 1_000_000;
}

function formatMs(ms) {
  return `${ms.toFixed(2)} ms`;
}

async function performRequest({ url, method, headers, body, timeoutMs, requestId }) {
  const start = process.hrtime.bigint();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload =
      body === undefined
        ? undefined
        : typeof body === 'string'
          ? body
          : JSON.stringify(body);

    const response = await fetch(url, {
      method,
      headers,
      body: payload,
      signal: controller.signal,
    });

    const end = process.hrtime.bigint();
    const durationMs = toMs(end - start);

    return {
      requestId,
      ok: response.ok,
      status: response.status,
      durationMs,
      error: null,
    };
  } catch (error) {
    const end = process.hrtime.bigint();
    const durationMs = toMs(end - start);
    return {
      requestId,
      ok: false,
      status: 'ERROR',
      durationMs,
      error: error?.name === 'AbortError' ? 'Timeout' : String(error?.message || error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const url = getArgValue('url', process.env.TARGET_URL || 'http://localhost:3001/api/states');
  const method = String(getArgValue('method', process.env.HTTP_METHOD || 'GET')).toUpperCase();
  const users = Number(getArgValue('users', process.env.CONCURRENT_USERS || '50'));
  const timeoutMs = Number(getArgValue('timeout', process.env.REQUEST_TIMEOUT_MS || '10000'));
  const rawHeaders = getArgValue('headers', process.env.REQUEST_HEADERS || '');
  const rawBody = getArgValue('body', process.env.REQUEST_BODY || '');

  if (!url) {
    throw new Error('Debes proporcionar --url o la variable TARGET_URL.');
  }

  if (!Number.isInteger(users) || users <= 0) {
    throw new Error('--users debe ser un entero positivo.');
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('--timeout debe ser un numero positivo en ms.');
  }

  const headers = parseHeaders(rawHeaders);
  const body = parseBody(rawBody);

  if (body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  console.log('============================================================');
  console.log('            REPORTE DE PRUEBA DE CONCURRENCIA');
  console.log('============================================================');
  console.log(`Fecha/Hora        : ${new Date().toLocaleString('es-NI')}`);
  console.log(`Endpoint          : ${url}`);
  console.log(`Metodo HTTP       : ${method}`);
  console.log(`Usuarios concurrentes: ${users}`);
  console.log(`Timeout por request: ${timeoutMs} ms`);
  console.log('------------------------------------------------------------');
  console.log('Ejecutando requests en paralelo...');

  const globalStart = process.hrtime.bigint();

  const tasks = Array.from({ length: users }, (_, index) =>
    performRequest({
      url,
      method,
      headers,
      body,
      timeoutMs,
      requestId: index + 1,
    })
  );

  const results = await Promise.all(tasks);
  const globalEnd = process.hrtime.bigint();
  const totalTimeMs = toMs(globalEnd - globalStart);

  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.length - successCount;
  const durations = results.map((r) => r.durationMs);
  const minMs = Math.min(...durations);
  const maxMs = Math.max(...durations);
  const avgMs = durations.reduce((acc, n) => acc + n, 0) / durations.length;

  const statusMap = new Map();
  for (const result of results) {
    const key = String(result.status);
    statusMap.set(key, (statusMap.get(key) || 0) + 1);
  }

  console.log('\nRESUMEN EJECUTIVO');
  console.table([
    {
      endpoint: url,
      metodo: method,
      usuarios: users,
      total: results.length,
      exitosas: successCount,
      errores: errorCount,
      exito_pct: `${((successCount / results.length) * 100).toFixed(2)}%`,
      tiempo_total: formatMs(totalTimeMs),
      min: formatMs(minMs),
      promedio: formatMs(avgMs),
      max: formatMs(maxMs),
    },
  ]);

  console.log('DISTRIBUCION POR ESTADO');
  console.table(
    Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => {
        if (a.status === 'ERROR') return 1;
        if (b.status === 'ERROR') return -1;
        return Number(a.status) - Number(b.status);
      })
  );

  if (errorCount > 0) {
    const errorSamples = results
      .filter((r) => r.error)
      .slice(0, 5)
      .map((r) => ({
        requestId: r.requestId,
        status: r.status,
        error: r.error,
      }));

    console.log('MUESTRA DE ERRORES (MAX 5)');
    console.table(errorSamples);
  }

  console.log('============================================================');
  console.log('Fin de prueba de concurrencia.');
  console.log('============================================================');
}

main().catch((error) => {
  console.error('Error en prueba de concurrencia:', error.message);
  process.exitCode = 1;
});

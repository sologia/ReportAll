export function logStructured(level, message, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const line = JSON.stringify(entry);
  if (level === 'error' || level === 'warn') {
    console.error(line);
    return;
  }

  console.log(line);
}

export function getRequestContext(req) {
  return {
    requestId: req.requestId || null,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
    userId: req.auth?.userId ?? null,
    userRole: req.auth?.role || '',
  };
}

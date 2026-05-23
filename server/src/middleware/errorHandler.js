export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const payload = {
    error: err.message ?? 'Internal Server Error',
  };
  if (err.code) payload.code = err.code;
  if (status >= 500) {
    console.error('[error]', status, err.message);
    if (err.stack) console.error(err.stack);
  } else {
    console.warn('[warn]', status, err.message);
  }
  res.status(status).json(payload);
}

export const manejadorErroresGlobal = (err, req, res, next) => {
  console.error(`[ERROR CRÍTICO] ${err.stack}`);
  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error Interno del Servidor';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    mensaje,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
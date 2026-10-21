import express from 'express';

const app = express();

// Middleware 1: Logger de Latencia HTTP
app.use((req, res, next) => {
  const inicio = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(inicio);
    const latenciaMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    console.log(`[LOG] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${latenciaMs} ms)`);
  });

  next();
});

// Middleware 2: Inyección de Encabezados Personalizados
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '2026.1.0');
  req.tiempoSolicitud = Date.now();
  next();
});
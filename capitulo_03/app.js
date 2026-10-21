import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import proyectosRouter from './routes/proyectos.routes.js';
import { manejadorErroresGlobal } from './middlewares/error.middleware.js';

const app = express();

// 1. Hardening de Cabeceras HTTP con Helmet
app.use(helmet());

// 2. Compresión de Payloads de Respuesta
app.use(compression());

// 3. Limitador de Tasa contra Ataques DDoS
const limitadorGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 100, // Máximo 100 peticiones por IP
  message: {
    status: 'error',
    mensaje: 'Demasiadas solicitudes desde esta IP, intente más tarde.'
  }
});
app.use('/api/', limitadorGeneral);

// 4. Parseador de JSON
app.use(express.json({ limit: '10kb' }));

// 5. Montaje de Enrutadores Modulares
app.use('/api/v1/proyectos', proyectosRouter);

// 6. Captura de Rutas Inexistentes (404)
app.use('*', (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// 7. Registrar el Middleware Centralizado de Errores
app.use(manejadorErroresGlobal);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[OK] Servidor de producción corriendo en http://localhost:${PORT}`);
});

export default app;
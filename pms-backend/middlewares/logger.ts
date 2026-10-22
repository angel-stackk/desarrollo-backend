// middlewares/logger.ts - Middlewares personalizados de inspección y registro
import { Request, Response, NextFunction } from 'express';

// Middleware 1: Logger de Latencia HTTP
export const loggerLatencia = (req: Request, res: Response, next: NextFunction) => {
  const inicio = process.hrtime();

  // Escuchar el evento finish de la respuesta
  res.on('finish', () => {
    const diff = process.hrtime(inicio);
    const latenciaMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    console.log(`[LOG] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${latenciaMs} ms)`);
  });

  next(); // Pasar el control al siguiente middleware
};

// Middleware 2: Inyección de Encabezados Personalizados
export const inyectarCabeceras = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-API-Version', '2026.1.0');
  (req as any).tiempoSolicitud = Date.now();
  next();
};

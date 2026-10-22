// middlewares/error.middleware.ts - Manejador Centralizado de Excepciones
import { Request, Response, NextFunction } from 'express';

export const manejadorErroresGlobal = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR CRÍTICO] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error Interno del Servidor';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    mensaje,
    // Ocultar la traza de pila (stack trace) en entorno de producción
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

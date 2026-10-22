import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del proyecto es obligatorio')
    .isLength({ min: 3, max: 60 }).withMessage('El nombre debe contener entre 3 y 60 caracteres'),
  body('start_time')
    .isISO8601().withMessage('La fecha de inicio debe tener un formato ISO8601 válido'),
  body('end_time')
    .isISO8601().withMessage('La fecha de fin debe tener un formato ISO8601 válido')
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.start_time)) {
        throw new Error('La fecha de fin debe ser estrictamente posterior a la fecha de inicio');
      }
      return true;
    }),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        statusCode: 400,
        status: 'fail',
        message: 'Error de validación en los datos de entrada',
        errors: errors.array()
      });
      return;
    }
    next();
  }
];

import { Express } from 'express';
import { UserController, forgotPassword } from './users_controller';
import { validate } from '../../utils/validator';
import { authorize } from '../../utils/auth_util';
import { body } from 'express-validator';

export const validUserInput = [
  body('fullname').trim().notEmpty().withMessage('El nombre completo es obligatorio'),
  body('username').trim().notEmpty().isLength({ min: 4, max: 30 }).withMessage('El usuario debe tener entre 4 y 30 caracteres'),
  body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('password')
    .isLength({ min: 6, max: 12 }).withMessage('La contraseña debe tener entre 6 y 12 caracteres')
    .isStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage('La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo especial'),
  body('role_ids').isArray().withMessage('Debe proporcionar un arreglo de UUIDs de roles válidos')
];

export class UserRoutes {
  private baseEndPoint = '/api/users';

  constructor(app: Express) {
    const controller = new UserController();

    // Rutas públicas
    app.route(this.baseEndPoint + '/login').post(controller.login);
    app.route(this.baseEndPoint + '/forgot-password').post(forgotPassword);
    app.route(this.baseEndPoint + '/reset-password').post(controller.resetPassword);

    // Rutas protegidas
    app.route(this.baseEndPoint + '/change-password').put(authorize, controller.changePassword);
    app.route(this.baseEndPoint)
      .get(authorize, controller.getAllHandler)
      .post(authorize, validate(validUserInput), controller.addHandler);
    app.route(this.baseEndPoint + '/:id')
      .get(authorize, controller.getOneHandler)
      .put(authorize, controller.updateHandler)
      .delete(authorize, controller.deleteHandler);
  }
}

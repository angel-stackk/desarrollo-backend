import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from './users_service';
import { Users } from './users_entity';
import { Rights, SERVER_CONST, encryptString, bcryptCompare } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';
import { NotificationUtil } from '../../utils/notification_util';
import { CacheUtil } from '../../utils/cache_util';

export class UserController {
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.USERS.GET_ALL)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar usuarios' });
      return;
    }

    const service = new UsersService();
    const result = await service.findAll(req.query);
    if (result.statusCode === 200 && Array.isArray(result.data)) {
      // Protección de seguridad: Eliminar contraseña de la respuesta
      result.data.forEach((user: any) => delete user.password);
    }

    res.status(result.statusCode).json(result);
  }

  /**
   * Consulta de usuario por ID con lectura previa de caché
   */
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.USERS.GET_DETAILS)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar el usuario' });
      return;
    }

    const userId = req.params.id;

    // 1. Intentar recuperar desde caché de Redis
    const userFromCache = await CacheUtil.get('User', userId);
    if (userFromCache) {
      res.status(200).json({ statusCode: 200, status: 'success', data: userFromCache });
      return;
    }

    // 2. Fallo de Caché (Cache Miss): consultar base de datos PostgreSQL
    const service = new UsersService();
    const result = await service.findOne(userId);
    if (result.statusCode === 200 && result.data) {
      // Eliminar campo sensible antes de guardar en caché
      delete (result.data as any).password;
      // 3. Almacenar resultado en caché para futuras peticiones
      CacheUtil.set('User', userId, result.data);
    }

    res.status(result.statusCode).json(result);
  }

  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.USERS.ADD)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para crear usuarios' });
      return;
    }

    const service = new UsersService();
    const data = { ...req.body };
    data.password = await encryptString(data.password);

    const result = await service.create(data);
    res.status(result.statusCode).json(result);
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.USERS.EDIT)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para actualizar usuarios' });
      return;
    }

    const service = new UsersService();
    const data = { ...req.body };
    if (data.password) {
      data.password = await encryptString(data.password);
    } else {
      delete data.password;
    }

    const result = await service.update(req.params.id, data);
    if (result.statusCode === 200) {
      // Invalidar la caché tras una actualización
      CacheUtil.remove('User', req.params.id);
    }

    res.status(result.statusCode).json(result);
  }

  /**
   * Eliminación de usuario con invalidación automática de caché
   */
  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.USERS.DELETE)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para eliminar usuarios' });
      return;
    }

    const userId = req.params.id;
    const service = new UsersService();
    const result = await service.delete(userId);
    if (result.statusCode === 200) {
      // Invalidar y remover la entidad eliminada de Redis
      CacheUtil.remove('User', userId);
    }

    res.status(result.statusCode).json(result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const service = new UsersService();
    const result = await service.findAll({ email });

    if (!result.data || (result.data as Users[]).length === 0) {
      res.status(404).json({ statusCode: 404, status: 'error', message: 'Correo electrónico no encontrado' });
      return;
    }

    const user = (result.data as Users[])[0];
    const isPasswordValid = await bcryptCompare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ statusCode: 400, status: 'error', message: 'Contraseña incorrecta' });
      return;
    }

    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS }
    );

    res.status(200).json({
      statusCode: 200,
      status: 'success',
      data: { accessToken, refreshToken }
    });
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    const user = await UsersUtil.getUserFromUsername(req.user?.username || '');

    if (!user) {
      res.status(404).json({ statusCode: 404, status: 'error', message: 'Usuario no encontrado' });
      return;
    }

    const isPasswordValid = await bcryptCompare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ statusCode: 400, status: 'error', message: 'La contraseña actual es incorrecta' });
      return;
    }

    const service = new UsersService();
    const result = await service.update(user.user_id, { password: await encryptString(newPassword) });
    if (result.statusCode === 200) {
      CacheUtil.remove('User', user.user_id);
    }

    res.status(result.statusCode).json(result);
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, SERVER_CONST.JWTSECRET) as any;
      const user = await UsersUtil.getUserByEmail(decoded.email);

      if (!user) {
        res.status(404).json({ statusCode: 404, status: 'error', message: 'Correo electrónico no registrado' });
        return;
      }

      const service = new UsersService();
      const result = await service.update(user.user_id, { password: await encryptString(newPassword) });
      if (result.statusCode === 200) {
        CacheUtil.remove('User', user.user_id);
      }

      res.status(result.statusCode).json(result);
    } catch (error) {
      res.status(400).json({ statusCode: 400, status: 'error', message: 'Token inválido o expirado' });
    }
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const user = await UsersUtil.getUserByEmail(email);

  if (!user) {
    res.status(404).json({ statusCode: 404, status: 'error', message: 'Correo electrónico no registrado' });
    return;
  }

  const resetToken = jwt.sign({ email: user.email }, SERVER_CONST.JWTSECRET, { expiresIn: '1h' });
  const resetLink = `http://127.0.0.1:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
    to: email,
    subject: 'Recuperación de Contraseña - Sistema PMS',
    html: `
      <h2>Hola ${user.fullname},</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para continuar (válido por 1 hora):</p>
      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
      <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
    `
  };

  const emailSent = await NotificationUtil.sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

  if (emailSent) {
    res.status(200).json({ statusCode: 200, status: 'success', message: 'Enlace de recuperación enviado al correo electrónico' });
  } else {
    res.status(500).json({ statusCode: 500, status: 'error', message: 'Fallo al enviar el correo de recuperación' });
  }
}

export class UsersUtil {
  public static async getUserFromUsername(username: string): Promise<Users | undefined> {
    const service = new UsersService();
    const result = await service.findAll({ username });

    if (Array.isArray(result.data) && result.data.length > 0) {
      return (result.data as Users[])[0];
    }
    return undefined;
  }

  public static async getUserByEmail(email: string): Promise<Users | undefined> {
    const service = new UsersService();
    const result = await service.findAll({ email });

    if (Array.isArray(result.data) && result.data.length > 0) {
      return (result.data as Users[])[0];
    }
    return undefined;
  }

  /**
   * Precarga masiva de usuarios en la caché de Redis al arrancar el servidor
   */
  public static async putAllUsersInCache(): Promise<void> {
    const userService = new UsersService();
    const result = await userService.findAll({});

    if (result.statusCode === 200 && Array.isArray(result.data)) {
      const users = result.data;
      users.forEach((user: any) => {
        delete user.password; // Sanitizar contraseña
        CacheUtil.set('User', user.user_id, user);
      });
      console.log('Todos los usuarios han sido cargados exitosamente en la caché');
    } else {
      console.error(`Error al ejecutar putAllUsersInCache: ${result.message}`);
    }
  }
}

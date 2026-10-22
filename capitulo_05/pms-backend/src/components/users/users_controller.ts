// src/components/users/users_controller.ts
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from './users_service';
import { Users } from './users_entity';
import { encryptString, bcryptCompare, SERVER_CONST } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';
import { sendMail } from '../../utils/email_util';

export class UsersUtil {
  public static async getUserFromUsername(username: string): Promise<Users | null> {
    const service = new UsersService();
    const res = await service.findAll({ username });
    if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0];
    }
    return null;
  }

  public static async getUserByEmail(email: string): Promise<Users | null> {
    const service = new UsersService();
    const res = await service.findAll({ email });
    if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0];
    }
    return null;
  }
}

export class UserController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    const service = new UsersService();
    const userData = { ...req.body };
    userData.password = await encryptString(userData.password);
    const result = await service.create(userData);
    if (result.statusCode === 201 && result.data) {
      delete (result.data as any).password;
    }
    res.status(result.statusCode).json(result);
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, 'get_all_users')) {
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

  public async getDetailsHandler(req: Request, res: Response): Promise<void> {
    const service = new UsersService();
    const result = await service.findOne(req.params.id as string);
    if (result.statusCode === 200 && result.data) {
      delete (result.data as any).password;
    }
    res.status(result.statusCode).json(result);
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    const service = new UsersService();
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await encryptString(updateData.password);
    }
    const result = await service.update(req.params.id as string, updateData);
    if (result.statusCode === 200 && result.data) {
      delete (result.data as any).password;
    }
    res.status(result.statusCode).json(result);
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    const service = new UsersService();
    const result = await service.delete(req.params.id as string);
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

  const emailSent = await sendMail(mailOptions.to, mailOptions.subject, mailOptions.html);

  if (emailSent) {
    res.status(200).json({ statusCode: 200, status: 'success', message: 'Enlace de recuperación enviado al correo electrónico' });
  } else {
    res.status(500).json({ statusCode: 500, status: 'error', message: 'Fallo al enviar el correo de recuperación' });
  }
}
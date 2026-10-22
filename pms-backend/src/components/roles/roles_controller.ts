import { Request, Response } from 'express';
import { In } from 'typeorm';
import { RolesService } from './roles_service';
import { Roles } from './roles_entity';
import { Rights } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';

export class RoleController {
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.ROLES.GET_ALL)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar roles' });
      return;
    }

    const service = new RolesService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
  }

  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.ROLES.ADD)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para crear roles' });
      return;
    }

    const service = new RolesService();
    const result = await service.create(req.body);
    res.status(result.statusCode).json(result);
  }

  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.ROLES.GET_DETAILS)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar el rol' });
      return;
    }

    const service = new RolesService();
    const result = await service.findOne(req.params.id);
    res.status(result.statusCode).json(result);
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.ROLES.EDIT)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para actualizar roles' });
      return;
    }

    const service = new RolesService();
    const result = await service.update(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.ROLES.DELETE)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para eliminar roles' });
      return;
    }

    const service = new RolesService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }
}

export class RolesUtil {
  public static getAllPermissionsFromRights(): string[] {
    const permissions: string[] = [];

    Object.values(Rights).forEach((module) => {
      Object.values(module).forEach((rights) => {
        rights.split(',').forEach((right) => {
          if (right && !permissions.includes(right)) {
            permissions.push(right);
          }
        });
      });
    });

    return permissions;
  }

  public static async getAllRightsFromRoles(roleIds: string[]): Promise<string[]> {
    const service = new RolesService();
    const result = await service.findAll({ role_id: In(roleIds) });

    const rights: string[] = [];
    if (Array.isArray(result.data)) {
      result.data.forEach((role: Roles) => {
        role.rights.split(',').forEach((right) => {
          if (right && !rights.includes(right)) {
            rights.push(right);
          }
        });
      });
    }

    return rights;
  }
}

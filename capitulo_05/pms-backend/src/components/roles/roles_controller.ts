// src/components/roles/roles_controller.ts
import { Request, Response } from 'express';
import { RolesService } from './roles_service';
import { Rights } from '../../utils/common';
import { Roles } from './roles_entity';

export class RolesUtil {
  public static getAllPermissionsFromRights(): string[] {
    let permissions: string[] = [];
    Object.values(Rights).forEach((moduleRights: any) => {
      if (moduleRights.ALL) {
        permissions = permissions.concat(moduleRights.ALL.split(',').map((r: string) => r.trim()));
      }
    });
    return Array.from(new Set(permissions));
  }

  public static async getAllRightsFromRoles(role_ids: string[]): Promise<string[]> {
    if (!role_ids || !Array.isArray(role_ids)) return [];
    const service = new RolesService();
    let rights: string[] = [];
    for (const id of role_ids) {
      const res = await service.findOne(id);
      if (res.statusCode === 200 && res.data) {
        const role = res.data as Roles;
        if (role.rights) {
          rights = rights.concat(role.rights.split(',').map(r => r.trim()));
        }
      }
    }
    return Array.from(new Set(rights));
  }
}

export class RoleController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.create(req.body);
    res.status(result.statusCode).json(result);
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
  }

  public async getOneHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findOne(req.params.id as string);
    res.status(result.statusCode).json(result);
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.update(req.params.id as string, req.body);
    res.status(result.statusCode).json(result);
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.delete(req.params.id as string);
    res.status(result.statusCode).json(result);
  }
}
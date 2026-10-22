import { RolesService } from '../components/roles/roles_service';
import { UsersService } from '../components/users/users_service';
import { Rights, encryptString } from './common';

export class DDLUtil {
  public static async addDefaultRole(): Promise<string | undefined> {
    const service = new RolesService();
    const rights = Object.values(Rights)
      .map((module) => module.ALL)
      .join(',');

    const result = await service.create({
      name: 'SuperAdmin',
      description: 'Acceso total con todos los derechos del sistema',
      rights
    });

    console.log('Resultado de Agregar Rol por Defecto:');
    console.log(JSON.stringify(result, null, 2));

    return (result.data as any)?.role_id;
  }

  public static async addDefaultUser(roleId: string): Promise<void> {
    const service = new UsersService();
    const password = await encryptString('Super@2026');

    const result = await service.create({
      fullname: 'Super Admin',
      username: 'superadmin',
      email: 'superadmin@pms.local',
      password,
      role_ids: [roleId]
    });

    console.log('Resultado de Agregar Usuario por Defecto:');
    console.log(JSON.stringify(result, null, 2));
  }
}

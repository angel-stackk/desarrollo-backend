// src/utils/ddl_util.ts
import { RolesService } from '../components/roles/roles_service';
import { UsersService } from '../components/users/users_service';
import { RolesUtil } from '../components/roles/roles_controller';
import { encryptString } from './common';

export class DDLUtil {
    public static async addDefaultRoleAndUser(): Promise<void> {
        const roleService = new RolesService();
        const userService = new UsersService();

        const allRights = RolesUtil.getAllPermissionsFromRights().join(',');
        const roleResult = await roleService.create({
            name: 'SuperAdmin',
            description: 'Acceso total con todos los derechos del sistema',
            rights: allRights
        });
        console.log('Resultado de Agregar Rol por Defecto:\n', JSON.stringify(roleResult, null, 2));

        const roleId = (roleResult.data as any)?.role_id;
        if (roleId) {
            const hashedPassword = await encryptString('Admin@123');
            const userResult = await userService.create({
                fullname: 'Super Administrador',
                username: 'superadmin',
                email: 'admin@pms.com',
                password: hashedPassword,
                role_ids: [roleId]
            });
            console.log('Resultado de Agregar Usuario por Defecto:\n', JSON.stringify(userResult, null, 2));
        }
    }
}
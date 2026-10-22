import { expect } from 'chai';
import { encryptString, bcryptCompare } from '../../src/utils/common';
import { hasPermission } from '../../src/utils/auth_util';
import { RolesUtil } from '../../src/components/roles/roles_controller';

describe('Pruebas unitarias: utilidades del sistema', () => {
  it('encryptString debe generar un hash distinto al texto plano', async () => {
    const hash = await encryptString('Super@2026');
    expect(hash).to.be.a('string');
    expect(hash).to.not.equal('Super@2026');
  });

  it('bcryptCompare debe validar correctamente la contraseña', async () => {
    const hash = await encryptString('Super@2026');
    expect(await bcryptCompare('Super@2026', hash)).to.equal(true);
    expect(await bcryptCompare('OtraClave1!', hash)).to.equal(false);
  });

  it('hasPermission debe validar el permiso atómico requerido', () => {
    expect(hasPermission(['get_all_users'], 'get_all_users')).to.equal(true);
    expect(hasPermission(['get_all_users'], 'delete_user')).to.equal(false);
    expect(hasPermission(undefined, 'get_all_users')).to.equal(false);
  });

  it('RolesUtil.getAllPermissionsFromRights debe devolver los permisos sin duplicados', () => {
    const permissions = RolesUtil.getAllPermissionsFromRights();
    expect(permissions).to.include('add_role');
    expect(permissions).to.include('delete_comment');
    expect(new Set(permissions).size).to.equal(permissions.length);
  });
});

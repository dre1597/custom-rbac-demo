import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserStatus } from '../../../src/apps/users/enum/user-status.enum';
import { Permission } from '../../../src/apps/users/models/permission.model';
import { Role } from '../../../src/apps/users/models/role.model';
import { User } from '../../../src/apps/users/models/user.model';
import { PermissionRepository } from '../../../src/apps/users/repositories/permission.repository';
import { RolePermissionRepository } from '../../../src/apps/users/repositories/role-permission.repository';
import { RoleRepository } from '../../../src/apps/users/repositories/role.repository';
import { UserRepository } from '../../../src/apps/users/repositories/user.repository';

export const createTestUserMock = async (
  app: INestApplication,
  dto: Partial<User> = {},
  status = UserStatus.ACTIVE,
): Promise<{
  user: User;
  role: Role;
  plainPassword: string;
}> => {
  const userRepository = app.get<UserRepository>(UserRepository);
  const plainPassword = 'Any_password123';

  const { role } = await createTestRoleMock(app);

  const user = await userRepository.create({
    email: `any_email_${randomUUID()}@email.com`,
    username: `any_username_${randomUUID()}`,
    password: plainPassword,
    roleId: role.id,
    status,
    ...dto,
  });

  return {
    user,
    role,
    plainPassword: plainPassword,
  };
};

export const createTestPermissionMock = async (
  app: INestApplication,
  dto: Partial<Permission> = {},
) => {
  const permissionRepository =
    app.get<PermissionRepository>(PermissionRepository);

  return permissionRepository.create({
    name: `any_name_${randomUUID()}`,
    scope: `any_scope_${randomUUID()}`,
    description: `any_description_${randomUUID()}`,
    ...dto,
  });
};

export const createTestRoleMock = async (
  app: INestApplication,
  dto: Partial<Role> = {},
) => {
  const roleRepository = app.get<RoleRepository>(RoleRepository);
  const rolePermissionRepository = app.get(RolePermissionRepository);
  const permission = await createTestPermissionMock(app);

  const role = await roleRepository.create({
    name: `any_name_${randomUUID()}`,
    ...dto,
  });

  await rolePermissionRepository.create({
    //TODO: improve this relation to be created on role creation
    roleId: role.id,
    permissionId: permission.id,
  });

  return {
    role,
    permission,
  };
};

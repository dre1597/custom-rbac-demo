import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './models/permission.model';
import { RefreshToken } from './models/refresh-token.model';
import { RolePermission } from './models/role-permissions.model';
import { Role } from './models/role.model';
import { User } from './models/user.model';
import { PermissionRepository } from './repositories/permission.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      RefreshToken,
      Role,
      Permission,
      RolePermission,
    ]),
  ],
  controllers: [UserController, RoleController],
  providers: [
    UserService,
    UserRepository,
    RefreshTokenRepository,
    RoleService,
    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,
  ],
  exports: [UserService],
})
export class UserModule {}

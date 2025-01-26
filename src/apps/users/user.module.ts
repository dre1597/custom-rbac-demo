import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './models/permission.model';
import { RefreshToken } from './models/refresh-token.model';
import { RolePermission } from './models/role-permissions.model';
import { Role } from './models/role.model';
import { User } from './models/user.model';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';
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
  controllers: [UserController],
  providers: [UserService, UserRepository, RefreshTokenRepository],
  exports: [UserService],
})
export class UserModule {}

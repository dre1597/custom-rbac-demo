import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { User } from './models/user.model';
import { RefreshToken } from './models/refresh-token.model';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Module({
  imports: [SequelizeModule.forFeature([User, RefreshToken])],
  controllers: [UserController],
  providers: [UserService, UserRepository, RefreshTokenRepository],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';

import { CustomConfigModule } from './config/custom-config.module';
import { SqliteModule } from './providers/database/sqlite.module';
import { UserModule } from './apps/users/user.module';
import { AuthModule } from './apps/auth/auth.module';
import { CustomJwtModule } from './providers/auth/custom-jwt.module';

@Module({
  imports: [
    CustomConfigModule,
    CustomJwtModule,
    SqliteModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}

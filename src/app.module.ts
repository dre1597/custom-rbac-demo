import { Module } from '@nestjs/common';
import { AuthModule } from './apps/auth/auth.module';
import { UserModule } from './apps/users/user.module';
import { CustomConfigModule } from './config/custom-config.module';
import { CustomJwtModule } from './providers/auth/custom-jwt.module';
import { SqliteModule } from './providers/database/sqlite.module';

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

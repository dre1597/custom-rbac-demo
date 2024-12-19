import { Module } from '@nestjs/common';
import { CustomConfigModule } from './config/custom-config.module';
import { SqliteModule } from './providers/database/sqlite.module';
import { UserModule } from './apps/users/user.module';

@Module({
  imports: [CustomConfigModule, SqliteModule, UserModule],
})
export class AppModule {}

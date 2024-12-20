import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('api.nodeEnv');
        const storage =
          nodeEnv === 'test'
            ? 'src/providers/database/database-test.sqlite'
            : 'src/providers/database/database.sqlite';

        return {
          dialect: 'sqlite',
          storage,
          autoLoadModels: true,
          synchronize: true,
          dialectOptions: {
            foreignKeys: true,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class SqliteModule {}

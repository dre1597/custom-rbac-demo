import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import * as databaseConfig from './config.json';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('api.nodeEnv');
        const config = databaseConfig[nodeEnv];

        return {
          ...config,
          autoLoadModels: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class SqliteModule {}

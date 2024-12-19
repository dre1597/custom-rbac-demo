import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IsEnum, IsNumber, IsOptional, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { apiConfig } from './custom-config';

export class ConfigValidationDto {
  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsOptional()
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV?: string;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [apiConfig],
      isGlobal: true,
      envFilePath: '.env',
      validate: (config: Record<string, any>) => {
        const validatedConfig = plainToInstance(ConfigValidationDto, config);
        const errors = validateSync(validatedConfig);
        if (errors.length > 0) {
          throw new Error(`Config validation failed: ${errors}`);
        }
        return config;
      },
    }),
  ],
})
export class CustomConfigModule {}

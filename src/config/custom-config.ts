import { registerAs } from '@nestjs/config';

export const apiConfig = registerAs('api', () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
}));

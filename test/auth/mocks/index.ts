import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { LoginDto } from '../../../src/apps/auth/dto/login.dto';

export const loginMock = async (
  app: INestApplication,
  dto?: LoginDto,
): Promise<request.Response> => {
  if (!dto) {
    dto = {
      username: 'admin',
      password: 'Password@123',
    };
  }

  return request(app.getHttpServer()).post('/auth/login').send(dto);
};

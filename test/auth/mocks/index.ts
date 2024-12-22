import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { LoginDto } from '../../../src/apps/auth/dto/login.dto';
import { createTestUserMock } from '../../user/mocks';

export const loginMock = async (
  app: INestApplication,
  dto?: LoginDto,
): Promise<request.Response> => {
  if (!dto) {
    const { user, plainPassword } = await createTestUserMock(app);
    dto = {
      username: user.username,
      password: plainPassword,
    };
  }

  return request(app.getHttpServer()).post('/auth/login').send(dto);
};

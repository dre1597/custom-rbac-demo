import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { LoginDto } from '../../../src/apps/auth/dto/login.dto';

export const loginMock = (app: INestApplication, dto: LoginDto) => {
  return request(app.getHttpServer()).post('/auth/login').send(dto);
};

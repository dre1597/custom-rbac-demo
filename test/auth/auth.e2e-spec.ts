import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';
import { createTestUserMock } from './mocks';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    sequelize = moduleFixture.get<Sequelize>(Sequelize);
    await sequelize.drop();
    await sequelize.sync();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login', async () => {
      const { user, plainPassword } = await createTestUserMock(app);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: user.username,
          password: plainPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        token: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          id: user.id,
          username: user.username,
        }),
      });
    });
  });
});
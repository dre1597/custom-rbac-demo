import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { LoginDto } from '../../src/apps/auth/dto/login.dto';
import { createTestUserMock } from '../user/mocks';
import { loginMock } from './mocks';

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

    it('should refresh token', async () => {
      const { user, plainPassword } = await createTestUserMock(app);

      const loginDto: LoginDto = {
        username: user.username,
        password: plainPassword,
      };

      const loginResponse = await loginMock(app, loginDto);

      const refreshToken = loginResponse.body.refreshToken;

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .send();

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

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';

import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/apps/users/dto/create-user.dto';
import { loginMock } from '../auth/mocks';
import { UserStatus } from '../../src/apps/users/enum/user-status.enum';

describe('UserController (e2e)', () => {
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

  describe('/users (POST)', () => {
    it('should create a user', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const dto: CreateUserDto = {
        username: 'any_username',
        password: 'any_password',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(201);
      expect(response.body.username).toBe(dto.username);
      expect(response.body.password).toBeUndefined();
      expect(response.body.status).toBe(UserStatus.ACTIVE);
    });

    it('should not create a user with existing username', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const dto: CreateUserDto = {
        username: 'admin',
        password: 'Password@123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Username already exists',
        error: 'Conflict',
      });
    });
  });
});

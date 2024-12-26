import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/apps/users/dto/create-user.dto';
import { UserStatus } from '../../src/apps/users/enum/user-status.enum';
import { loginMock } from '../auth/mocks';
import { createTestUserMock } from './mocks';

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

  describe('/:id/activate (PATCH)', () => {
    it('should activate a user', async () => {
      const { user } = await createTestUserMock(
        app,
        undefined,
        UserStatus.INACTIVE,
      );

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}/activate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(UserStatus.ACTIVE);
    });

    it('should throw error if user not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch('/users/0/activate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      });
    });
  });

  describe('/:id/inactivate (PATCH)', () => {
    it('should inactivate a user', async () => {
      const { user } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}/inactivate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(UserStatus.INACTIVE);
    });

    it('should throw error if user not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch('/users/0/inactivate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      });
    });
  });
});

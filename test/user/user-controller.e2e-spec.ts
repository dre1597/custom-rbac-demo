import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/apps/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/apps/users/dto/update-user.dto';
import { UserStatus } from '../../src/apps/users/enum/user-status.enum';
import { Role } from '../../src/apps/users/models/role.model';
import { User } from '../../src/apps/users/models/user.model';
import { SequelizeExceptionFilter } from '../../src/common/exceptions/sequelize-exception.filter';
import { loginMock } from '../auth/mocks';
import { createTestRoleMock, createTestUserMock } from './mocks';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let role: Role;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    app.useGlobalFilters(new SequelizeExceptionFilter());
    await app.init();

    sequelize = moduleFixture.get<Sequelize>(Sequelize);
    await sequelize.drop();
    await sequelize.sync();

    role = await createTestRoleMock(app);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should get all users', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining(
          response.body.data.map(() =>
            expect.objectContaining({
              id: expect.any(String),
              username: expect.any(String),
              createdAt: expect.any(String),
              status: UserStatus.ACTIVE,
              role: {
                id: expect.any(String),
                name: expect.any(String),
              },
            }),
          ),
        ),
      );
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        perPage: 10,
        totalItems: 1,
        previousPage: null,
        nextPage: null,
      });
    });

    it('should paginate users', async () => {
      const { user, role } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 2, perPage: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: [
          {
            id: user.id,
            username: user.username,
            createdAt: expect.any(String),
            status: user.status,
            role: {
              id: role.id,
              name: role.name,
            },
          },
        ],
        pagination: {
          currentPage: 2,
          perPage: 1,
          totalItems: 2,
          previousPage: 1,
          nextPage: null,
        },
      });
    });

    it('should search users', async () => {
      await createTestRoleMock(app);
      const { user, role } = await createTestUserMock(app, {
        username: 'username_to_search',
      });

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .query({ search: 'search' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: [
          {
            id: user.id,
            username: user.username,
            createdAt: expect.any(String),
            status: user.status,
            role: {
              id: role.id,
              name: role.name,
            },
          },
        ],
        pagination: {
          currentPage: 1,
          perPage: 10,
          totalItems: 1,
          previousPage: null,
          nextPage: null,
        },
      });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get a user', async () => {
      const { user, role } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: user.id,
        username: user.username,
        createdAt: expect.any(String),
        status: user.status,
        role: {
          id: role.id,
          name: role.name,
        },
      });
    });
  });

  describe('/users (POST)', () => {
    it('should create a user', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const dto: CreateUserDto = {
        username: 'any_username',
        password: 'Any_password@123',
        roleId: role.id,
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
        password: 'Any_password@123',
        roleId: role.id,
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

    it('should not create a user with invalid role id', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const dto: CreateUserDto = {
        username: 'any_username',
        password: 'Any_password@123',
        roleId: randomUUID(),
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Role not found',
        error: 'Not Found',
      });
    });
  });

  describe('/users/:id/activate (PATCH)', () => {
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

  describe('/users/:id/inactivate (PATCH)', () => {
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

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      const { user } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const dto: UpdateUserDto = {
        username: 'updated_username',
        roleId: role.id,
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(dto.username);
      expect(response.body.roleId).toBe(dto.roleId);
    });

    it('should throw error if user not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch('/users/0')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      });
    });

    it('should throw error if username is duplicated', async () => {
      const { user: userWithSameUsername } = await createTestUserMock(app);
      const { user: userToUpdate } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch(`/users/${userToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: userWithSameUsername.username });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Username already exists',
        error: 'Conflict',
      });
    });

    it('should throw error if role not found', async () => {
      const { user } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roleId: randomUUID() });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Role not found',
        error: 'Not Found',
      });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete a user', async () => {
      const { user } = await createTestUserMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedUser = await sequelize.model(User).findByPk(user.id);

      expect(deletedUser).toBeNull();
    });

    it('should not throw an error if user not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .delete('/users/0')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });
});

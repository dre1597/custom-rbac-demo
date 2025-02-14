import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { exec } from 'child_process';
import { randomUUID } from 'node:crypto';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { promisify } from 'util';
import { AppModule } from '../../src/app.module';
import { CreateRoleDto } from '../../src/apps/users/dto/create-role.dto';
import { UpdateRoleDto } from '../../src/apps/users/dto/update-role.dto';
import { RoleStatus } from '../../src/apps/users/enum/role-status.enum';
import { Role } from '../../src/apps/users/models/role.model';
import { SequelizeExceptionFilter } from '../../src/common/exceptions/sequelize-exception.filter';
import { loginMock } from '../auth/mocks';
import { createTestPermissionMock, createTestRoleMock } from './mocks';

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

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

    const execPromise = promisify(exec);
    await execPromise('npx sequelize-cli db:seed:all');
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/roles (GET)', () => {
    it('should get all roles', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining(
          response.body.map(() =>
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              createdAt: expect.any(String),
              status: RoleStatus.ACTIVE,
              permissions: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  name: expect.any(String),
                  createdAt: expect.any(String),
                }),
              ]),
            }),
          ),
        ),
      );
    });
  });

  describe('/roles/:id (GET)', () => {
    it('should get a role', async () => {
      const { role, permission } = await createTestRoleMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get(`/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: role.id,
        name: role.name,
        createdAt: expect.any(String),
        status: role.status,
        permissions: [
          {
            id: permission.id,
            name: permission.name,
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('should not get a role not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .get(`/roles/${randomUUID()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Role not found',
        error: 'Not Found',
      });
    });
  });

  describe('/roles (POST)', () => {
    it('should create a role', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const permission = await createTestPermissionMock(app);

      const dto: CreateRoleDto = {
        name: 'any_role',
        permissions: [permission.id],
      };

      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: dto.name,
        createdAt: expect.any(String),
        status: RoleStatus.ACTIVE,
        permissions: [
          {
            id: permission.id,
            name: permission.name,
            scope: permission.scope,
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('should throw error if name is duplicated', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      await createTestRoleMock(app, {
        name: 'any_role',
      });

      const permission = await createTestPermissionMock(app);

      const dto: CreateRoleDto = {
        name: 'any_role',
        permissions: [permission.id],
      };

      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body).toMatchObject({
        statusCode: HttpStatus.CONFLICT,
        message: 'Role already exists',
        error: 'Conflict',
      });
    });

    it('should not create a role with invalid permissions', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const dto: CreateRoleDto = {
        name: 'any_role',
        permissions: [randomUUID()],
      };

      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Some permissions not found',
        error: 'Not Found',
      });
    });
  });

  describe('/roles/:id/activate (PATCH)', () => {
    it('should activate a role', async () => {
      const { role } = await createTestRoleMock(
        app,
        undefined,
        RoleStatus.INACTIVE,
      );

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch(`/roles/${role.id}/activate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.status).toBe(RoleStatus.ACTIVE);
    });

    it('should throw error if role not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch('/roles/0/activate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Role not found',
        error: 'Not Found',
      });
    });
  });

  describe('/roles/:id/inactivate (PATCH)', () => {
    it('should inactivate a roles', async () => {
      const { role } = await createTestRoleMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch(`/roles/${role.id}/inactivate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.status).toBe(RoleStatus.INACTIVE);
    });

    it('should throw error if role not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch('/roles/0/inactivate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Role not found',
        error: 'Not Found',
      });
    });
  });

  describe('/roles/:id (PATCH)', () => {
    it('should update a role', async () => {
      const { role } = await createTestRoleMock(app);
      const permission = await createTestPermissionMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const dto: UpdateRoleDto = {
        name: 'updated_role',
        permissions: [permission.id],
      };

      const response = await request(app.getHttpServer())
        .patch(`/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: dto.name,
        status: role.status,
        createdAt: expect.any(String),
        permissions: [
          {
            id: permission.id,
            name: permission.name,
            scope: permission.scope,
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('should throw error if role not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .patch('/roles/0')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Role not found',
        error: 'Not Found',
      });
    });

    it('should throw error if name is duplicated', async () => {
      const { role } = await createTestRoleMock(app, {
        name: 'any_role',
      });

      await createTestRoleMock(app, {
        name: 'updated_role',
      });

      const {
        body: { token },
      } = await loginMock(app);

      const dto: UpdateRoleDto = {
        name: 'updated_role',
      };

      const response = await request(app.getHttpServer())
        .patch(`/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'Role already exists',
        error: 'Conflict',
      });
    });
    it('should not create a role with invalid permissions', async () => {
      const { role } = await createTestRoleMock(app, {
        name: 'any_role',
      });

      const {
        body: { token },
      } = await loginMock(app);

      const dto: UpdateRoleDto = {
        permissions: [randomUUID()],
      };

      const response = await request(app.getHttpServer())
        .patch(`/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Some permissions not found',
        error: 'Not Found',
      });
    });
  });

  describe('/roles/:id (DELETE)', () => {
    it('should delete a role', async () => {
      const { role } = await createTestRoleMock(app);

      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .delete(`/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const deletedRole = await sequelize.model(Role).findByPk(role.id);

      expect(deletedRole).toBeNull();
    });

    it('should not throw an error if user not found', async () => {
      const {
        body: { token },
      } = await loginMock(app);

      const response = await request(app.getHttpServer())
        .delete('/roles/0')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });
  });
});

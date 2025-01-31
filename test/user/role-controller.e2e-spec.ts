import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateRoleDto } from '../../src/apps/users/dto/create-role.dto';
import { RoleStatus } from '../../src/apps/users/enum/role-status.enum';
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

      expect(response.status).toBe(200);
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

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: dto.name,
        createdAt: expect.any(String),
        status: RoleStatus.ACTIVE,
      });
    });

    it('should not create a role with a existing name', async () => {
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

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        statusCode: 409,
        message: 'Role already exists',
        error: 'Conflict',
      });
    });

    it('should not create a role without permissions', async () => {
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

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Some permissions not found',
        error: 'Not Found',
      });
    });
  });
});

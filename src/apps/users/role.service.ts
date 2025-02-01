import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleStatus } from './enum/role-status.enum';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private sequelize: Sequelize,
  ) {}

  async findAll() {
    return this.roleRepository.findAll({
      include: ['permissions'],
    });
  }

  async create(dto: CreateRoleDto) {
    const transaction = await this.sequelize.transaction();

    try {
      const roleExists = await this.roleRepository.findOne({
        where: {
          name: dto.name,
        },
      });

      if (roleExists) {
        throw new ConflictException('Role already exists');
      }

      const permissions = await this.permissionRepository.findAll({
        where: {
          id: dto.permissions,
        },
      });

      if (permissions.length !== dto.permissions.length) {
        throw new NotFoundException('Some permissions not found');
      }

      const role = await this.roleRepository.create(
        {
          name: dto.name,
        },
        {
          transaction,
        },
        false,
      );

      await role.$set('permissions', dto.permissions, { transaction });

      await transaction.commit();

      return {
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        status: role.status,
        permissions: permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          createdAt: permission.createdAt,
        })),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findOne(id: string) {
    const role = await this.roleRepository.getDetails(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async updateStatus(id: string, status: RoleStatus) {
    const role = await this.roleRepository.findByPk(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.status = status;

    await this.roleRepository.update(role, {
      where: {
        id,
      },
    });

    return role;
  }
}

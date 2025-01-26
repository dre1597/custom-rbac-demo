import { Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionRepository } from './repositories/permission.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private sequelize: Sequelize,
  ) {}

  async create(dto: CreateRoleDto) {
    const transaction = await this.sequelize.transaction();

    try {
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
      );

      await Promise.all(
        dto.permissions.map((permissionId) =>
          this.rolePermissionRepository.create(
            {
              roleId: role.id,
              permissionId: permissionId,
            },
            {
              transaction,
            },
          ),
        ),
      );

      await transaction.commit();
      return role;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

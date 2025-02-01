import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../../common/repositories/base-repository';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectModel(Role)
    roleModel: typeof Role,
  ) {
    super(roleModel);
  }

  getDetails(id: string) {
    return this.model.findByPk(id, {
      attributes: ['id', 'name', 'status', 'createdAt'],
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'scope', 'description', 'createdAt'],
          through: { attributes: [] },
        },
      ],
    });
  }
}

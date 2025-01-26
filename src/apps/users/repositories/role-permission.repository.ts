import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../../common/repositories/base-repository';
import { RolePermission } from '../models/role-permissions.model';

@Injectable()
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor(
    @InjectModel(RolePermission)
    rolePermissionModel: typeof RolePermission,
  ) {
    super(rolePermissionModel);
  }
}

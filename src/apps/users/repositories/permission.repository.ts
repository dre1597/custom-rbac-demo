import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../../common/repositories/base-repository';
import { Permission } from '../models/permission.model';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(
    @InjectModel(Permission)
    permissionModel: typeof Permission,
  ) {
    super(permissionModel);
  }
}

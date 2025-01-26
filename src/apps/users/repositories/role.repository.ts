import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../../common/repositories/base-repository';
import { Role } from '../models/role.model';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectModel(Role)
    roleModel: typeof Role,
  ) {
    super(roleModel);
  }
}

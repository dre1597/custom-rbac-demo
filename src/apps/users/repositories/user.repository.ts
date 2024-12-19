import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { User } from '../entities/user.entity';
import { BaseRepository } from '../../../common/repositories/base-repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User)
    userModel: typeof User,
  ) {
    super(userModel);
  }
}

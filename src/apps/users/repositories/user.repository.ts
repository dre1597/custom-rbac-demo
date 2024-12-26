import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../../common/repositories/base-repository';
import { RefreshToken } from '../models/refresh-token.model';
import { User } from '../models/user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User)
    userModel: typeof User,
  ) {
    super(userModel);
  }

  findByPkWithRelations(id: string) {
    return this.model.findByPk(id, {
      include: [
        {
          model: RefreshToken,
          as: 'refreshToken',
        },
      ],
    });
  }
}

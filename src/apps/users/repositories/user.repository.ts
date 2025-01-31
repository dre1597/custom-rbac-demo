import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseRepository } from '../../../common/repositories/base-repository';
import { paginate } from '../../../common/repositories/helpers/pagination';
import { FindAllUsersDto } from '../dto/find-all-users.dto';
import { RefreshToken } from '../models/refresh-token.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User)
    userModel: typeof User,
  ) {
    super(userModel);
  }

  async findAllWithPagination(dto: FindAllUsersDto) {
    const { search = '', page, perPage } = dto;

    const searchConditions = search
      ? {
          [Op.or]: [
            {
              username: {
                [Op.like]: `%${search.toLowerCase()}%`,
              },
            },
            {
              '$role.name$': {
                [Op.like]: `%${search.toLowerCase()}%`,
              },
            },
          ],
        }
      : {};

    const { count, rows: data } = await this.model.findAndCountAll({
      where: searchConditions,
      offset: (page - 1) * perPage,
      limit: perPage,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'username', 'createdAt', 'status'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
        },
      ],
    });

    return paginate(data, page, perPage, count);
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

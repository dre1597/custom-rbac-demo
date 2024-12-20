import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { BaseRepository } from '../../../common/repositories/base-repository';
import { RefreshToken } from '../models/refresh-token.model';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor(
    @InjectModel(RefreshToken)
    refreshTokenModel: typeof RefreshToken,
  ) {
    super(refreshTokenModel);
  }
}

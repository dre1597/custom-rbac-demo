import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserStatus } from './enum/user-status.enum';
import { RefreshToken } from './models/refresh-token.model';
import { User } from './models/user.model';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async create(dto: CreateUserDto) {
    const userExists = await this.userRepository.findOne({
      where: {
        username: dto.username,
      },
    });

    if (userExists) {
      throw new ConflictException('Username already exists');
    }

    const userCreated = await this.userRepository.create({
      ...dto,
    });
    delete userCreated.password;
    return userCreated;
  }

  findByPkWithRelations(id: string) {
    return this.userRepository.findByPkWithRelations(id);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.validatePassword(user, password);
  }

  async updateRefreshToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken> {
    const user = await this.userRepository.findByPkWithRelations(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return await this.refreshTokenRepository.create(
      {
        token,
        userId: user.id,
      },
      {
        fields: ['token', 'userId'],
      },
    );
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.userRepository.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;

    await this.userRepository.update(user, {
      where: {
        id,
      },
    });

    return user;
  }

  private async validatePassword(user: User, password: string) {
    if (!user.comparePassword(password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}

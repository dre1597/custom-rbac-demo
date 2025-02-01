import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enum/user-status.enum';
import { RefreshToken } from './models/refresh-token.model';
import { User } from './models/user.model';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  findAll(dto: FindAllUsersDto) {
    return this.userRepository.findAllWithPagination(dto);
  }

  findOne(id: string) {
    return this.userRepository.getDetails(id);
  }

  async create(dto: CreateUserDto) {
    const userExists = await this.userRepository.findOne({
      where: {
        username: dto.username,
      },
    });

    if (userExists) {
      throw new ConflictException('Username already exists');
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: dto.roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
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

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto?.username && dto.username !== user.username) {
      const userExists = await this.userRepository.findOne({
        where: {
          username: dto.username,
        },
      });

      if (userExists) {
        throw new ConflictException('Username already exists');
      }
    }

    if (dto.roleId) {
      const role = await this.roleRepository.findOne({
        where: {
          id: dto.roleId,
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    const userToUpdate = {
      ...user.toJSON(),
      ...dto,
    };

    await this.userRepository.update(userToUpdate, {
      where: {
        id,
      },
    });

    delete userToUpdate.password;

    return userToUpdate;
  }

  async delete(id: string) {
    const user = await this.userRepository.findByPk(id);

    if (!user) {
      return;
    }

    await this.userRepository.softDelete(id);
  }

  private async validatePassword(user: User, password: string) {
    if (!user.comparePassword(password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}

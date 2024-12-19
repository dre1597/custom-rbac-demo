import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
    const user = userCreated.toJSON();
    delete user.password;
    return user;
  }
}

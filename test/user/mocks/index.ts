import { INestApplication } from '@nestjs/common';

import { User } from '../../../src/apps/users/models/user.model';
import { UserRepository } from '../../../src/apps/users/repositories/user.repository';

export const createTestUserMock = async (
  app: INestApplication,
): Promise<{
  user: User;
  plainPassword: string;
}> => {
  const userRepository = app.get<UserRepository>(UserRepository);
  const plainPassword = 'Any_password123';

  const user = await userRepository.create({
    name: 'any_name',
    email: 'any_email@email.com',
    username: 'any_username',
    password: plainPassword,
  });

  return {
    user,
    plainPassword: plainPassword,
  };
};

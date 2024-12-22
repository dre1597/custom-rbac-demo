import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { User } from '../../../src/apps/users/models/user.model';
import { UserRepository } from '../../../src/apps/users/repositories/user.repository';

export const createTestUserMock = async (
  app: INestApplication,
  dto: Partial<User> = {},
): Promise<{
  user: User;
  plainPassword: string;
}> => {
  const userRepository = app.get<UserRepository>(UserRepository);
  const plainPassword = 'Any_password123';

  const user = await userRepository.create({
    email: `any_email_${randomUUID()}@email.com`,
    username: `any_username_${randomUUID()}`,
    password: plainPassword,
    ...dto,
  });

  return {
    user,
    plainPassword: plainPassword,
  };
};

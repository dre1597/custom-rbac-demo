'use strict';

const {
  UserStatus,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('../../../../dist/apps/users/enum/user-status.enum');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require('node:crypto');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id
       FROM roles
       WHERE name = 'admin'
       LIMIT 1;`,
    );

    return queryInterface.bulkInsert('users', [
      {
        id: randomUUID(),
        username: 'admin',
        password: bcrypt.hashSync('Password@123', 10),
        status: UserStatus.ACTIVE,
        roleId: adminRole[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('users', { username: 'admin' });
  },
};

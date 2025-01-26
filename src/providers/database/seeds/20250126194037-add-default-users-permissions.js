'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('permissions', [
      {
        id: randomUUID(),
        name: 'view',
        scope: 'user',
        description: 'Read user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'create',
        scope: 'user',
        description: 'Create user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'edit',
        scope: 'user',
        description: 'Edit user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'delete',
        scope: 'user',
        description: 'Delete user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'change-status',
        scope: 'user',
        description: 'Change user status',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('permissions', null);
  },
};

'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require('crypto');
const {
  PermissionName,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('../../../../dist/apps/users/enum/permission-name.enum');
const {
  PermissionScope,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('../../../../dist/apps/users/enum/permission-scope.enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const userPermissions = [
      {
        id: randomUUID(),
        name: PermissionName.LIST,
        scope: PermissionScope.USER,
        description: 'Read user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.CREATE,
        scope: PermissionScope.USER,
        description: 'Create user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.UPDATE,
        scope: PermissionScope.USER,
        description: 'Edit user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.DELETE,
        scope: PermissionScope.USER,
        description: 'Delete user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.CHANGE_STATUS,
        scope: PermissionScope.USER,
        description: 'Change user status',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const rolePermissions = [
      {
        id: randomUUID(),
        name: PermissionName.LIST,
        scope: PermissionScope.ROLE,
        description: 'Read role data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.CREATE,
        scope: PermissionScope.ROLE,
        description: 'Create role data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.UPDATE,
        scope: PermissionScope.ROLE,
        description: 'Edit role data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.DELETE,
        scope: PermissionScope.ROLE,
        description: 'Delete role data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: PermissionName.CHANGE_STATUS,
        scope: PermissionScope.ROLE,
        description: 'Change role status',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('permissions', [
      ...userPermissions,
      ...rolePermissions,
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('permissions', null);
  },
};

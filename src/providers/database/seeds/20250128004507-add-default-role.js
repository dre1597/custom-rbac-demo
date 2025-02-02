'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require('node:crypto');
const {
  RoleStatus,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('../../../../dist/apps/users/enum/role-status.enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const adminRoleId = randomUUID();
    await queryInterface.bulkInsert('roles', [
      {
        id: adminRoleId,
        name: 'admin',
        status: RoleStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id
       FROM permissions;`,
    );

    const rolePermissions = permissions.map((permission) => ({
      roleId: adminRoleId,
      permissionId: permission.id,
    }));

    await queryInterface.bulkInsert('role_permissions', rolePermissions);
  },

  async down(queryInterface) {
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id
       FROM roles
       WHERE name = 'admin' LIMIT 1;`,
    );

    if (adminRole && adminRole.length > 0) {
      const adminRoleId = adminRole[0].id;
      await queryInterface.bulkDelete('role_permissions', {
        roleId: adminRoleId,
      });
    }

    return queryInterface.bulkDelete('roles', { name: 'admin' });
  },
};

import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../../users/enum/permission-name.enum';
import { PermissionScope } from '../../users/enum/permission-scope.enum';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (
  ...permissions: { name: PermissionName; scope: PermissionScope }[]
) => SetMetadata(PERMISSIONS_KEY, permissions);

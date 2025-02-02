import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionName } from '../../users/enum/permission-name.enum';
import { PermissionScope } from '../../users/enum/permission-scope.enum';
import { User } from '../../users/models/user.model';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

export type RequiredPermission = {
  name: PermissionName;
  scope: PermissionScope;
};

@Injectable()
export class PermissionsGuard {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<RequiredPermission[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions || !requiredPermissions.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const hasPermission = await this.validateUserPermissions(
      user,
      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        "You don't have permission to access this resource",
      );
    }

    return true;
  }

  private async validateUserPermissions(
    user: User,
    requiredPermissions: RequiredPermission[],
  ): Promise<boolean> {
    if (!user?.role?.permissions?.length) {
      return false;
    }

    return requiredPermissions.some((requiredPermission) =>
      user.role.permissions.some(
        (permission) =>
          permission.name === requiredPermission.name &&
          permission.scope === requiredPermission.scope,
      ),
    );
  }
}

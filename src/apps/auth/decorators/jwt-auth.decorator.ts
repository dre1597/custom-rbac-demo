import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

export function JwtAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    ApiBearerAuth('defaultBearerAuth'),
  );
}

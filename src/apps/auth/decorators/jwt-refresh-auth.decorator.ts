import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';

export function JwtRefreshAuth() {
  return applyDecorators(
    UseGuards(JwtRefreshAuthGuard),
    ApiBearerAuth('refreshBearerAuth'),
  );
}

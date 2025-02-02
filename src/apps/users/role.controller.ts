import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionName } from './enum/permission-name.enum';
import { PermissionScope } from './enum/permission-scope.enum';
import { RoleStatus } from './enum/role-status.enum';
import { RoleService } from './role.service';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Permissions({
    name: PermissionName.LIST,
    scope: PermissionScope.ROLE,
  })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Permissions({
    name: PermissionName.LIST,
    scope: PermissionScope.ROLE,
  })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @Permissions({
    name: PermissionName.CREATE,
    scope: PermissionScope.ROLE,
  })
  @JwtAuth()
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Patch(':id/activate')
  @JwtAuth()
  @Permissions({
    name: PermissionName.CHANGE_STATUS,
    scope: PermissionScope.ROLE,
  })
  activate(@Param('id') id: string) {
    return this.roleService.updateStatus(id, RoleStatus.ACTIVE);
  }

  @Patch(':id/inactivate')
  @JwtAuth()
  @Permissions({
    name: PermissionName.CHANGE_STATUS,
    scope: PermissionScope.ROLE,
  })
  inactivate(@Param('id') id: string) {
    return this.roleService.updateStatus(id, RoleStatus.INACTIVE);
  }

  @Patch(':id')
  @JwtAuth()
  @Permissions({
    name: PermissionName.UPDATE,
    scope: PermissionScope.ROLE,
  })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @JwtAuth()
  @Permissions({
    name: PermissionName.DELETE,
    scope: PermissionScope.ROLE,
  })
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}

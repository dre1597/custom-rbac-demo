import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleStatus } from './enum/role-status.enum';
import { RoleService } from './role.service';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Patch(':id/activate')
  @JwtAuth()
  activate(@Param('id') id: string) {
    return this.roleService.updateStatus(id, RoleStatus.ACTIVE);
  }

  @Patch(':id/inactivate')
  @JwtAuth()
  inactivate(@Param('id') id: string) {
    return this.roleService.updateStatus(id, RoleStatus.INACTIVE);
  }

  @Patch(':id')
  @JwtAuth()
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @JwtAuth()
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}

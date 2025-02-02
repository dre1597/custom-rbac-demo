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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionName } from './enum/permission-name.enum';
import { PermissionScope } from './enum/permission-scope.enum';
import { UserStatus } from './enum/user-status.enum';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @JwtAuth()
  @Permissions({
    name: PermissionName.LIST,
    scope: PermissionScope.USER,
  })
  findAll(@Query() dto: FindAllUsersDto) {
    return this.userService.findAll(dto);
  }

  @Get(':id')
  @JwtAuth()
  @Permissions({
    name: PermissionName.LIST,
    scope: PermissionScope.USER,
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @JwtAuth()
  @Permissions({
    name: PermissionName.CREATE,
    scope: PermissionScope.USER,
  })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id/activate')
  @JwtAuth()
  @Permissions({
    name: PermissionName.CHANGE_STATUS,
    scope: PermissionScope.USER,
  })
  activate(@Param('id') id: string) {
    return this.userService.updateStatus(id, UserStatus.ACTIVE);
  }

  @Patch(':id/inactivate')
  @JwtAuth()
  @Permissions({
    name: PermissionName.CHANGE_STATUS,
    scope: PermissionScope.USER,
  })
  inactivate(@Param('id') id: string) {
    return this.userService.updateStatus(id, UserStatus.INACTIVE);
  }

  @Patch(':id')
  @JwtAuth()
  @Permissions({
    name: PermissionName.UPDATE,
    scope: PermissionScope.USER,
  })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @JwtAuth()
  @Permissions({
    name: PermissionName.DELETE,
    scope: PermissionScope.USER,
  })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}

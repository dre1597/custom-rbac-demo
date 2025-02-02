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
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enum/user-status.enum';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @JwtAuth()
  findAll(@Query() dto: FindAllUsersDto) {
    return this.userService.findAll(dto);
  }

  @Get(':id')
  @JwtAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @JwtAuth()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id/activate')
  @JwtAuth()
  activate(@Param('id') id: string) {
    return this.userService.updateStatus(id, UserStatus.ACTIVE);
  }

  @Patch(':id/inactivate')
  @JwtAuth()
  inactivate(@Param('id') id: string) {
    return this.userService.updateStatus(id, UserStatus.INACTIVE);
  }

  @Patch(':id')
  @JwtAuth()
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @JwtAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}

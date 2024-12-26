import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserStatus } from './enum/user-status.enum';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @JwtAuth()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
}

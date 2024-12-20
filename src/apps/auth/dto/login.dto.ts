import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ default: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

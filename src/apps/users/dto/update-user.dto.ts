import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  username: string;
}

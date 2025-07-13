import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthInputDto {
  @ApiProperty({
    example: 'test@test.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty({
    example: 'password',
    required: true,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

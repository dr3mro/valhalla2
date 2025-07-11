import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ApiProperty({
    example: 'A1#po!q2A',
    description:
      'Password must be strong with at least 8 characters, including uppercase, lowercase, numbers, and symbols.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Egypt' })
  country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '+201234567890' })
  phone: string;

  @IsNotEmpty()
  @IsEnum(Role)
  @ApiProperty({ example: Role.ADMIN, enum: Role, description: 'User role' })
  role: Role;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '1990-01-01' })
  dob: string;
}

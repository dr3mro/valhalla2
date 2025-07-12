import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) body: AuthInputDto,
  ): Promise<SignInResponseDto> {
    const loginResult = await this.authService.validateUser(body);

    if (loginResult) {
      return loginResult;
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}

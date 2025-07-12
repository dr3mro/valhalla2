import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    const loginResult = await this.authService.validateUser(body);

    if (loginResult) {
      return { message: 'Login successful', data: loginResult };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}

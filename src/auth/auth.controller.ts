import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login() {
    const loginResult = await this.authService.validateUser({
      username: 'dr3mro@gmail.com',
      password: 'A1#po!q2A',
    });

    if (loginResult) {
      return { message: 'Login successful', data: loginResult };
    } else {
      return { message: 'Login failed' };
    }
  }
}

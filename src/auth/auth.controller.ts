import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';
import { AuthGuard } from './guards/auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) body: AuthInputDto,
  ): Promise<SignInResponseDto> {
    const loginResult = await this.authService.authenticate(body);

    if (loginResult) {
      return loginResult;
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  getProfile(@Req() request: RequestWithUser): User | null {
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return request.user;
  }
}

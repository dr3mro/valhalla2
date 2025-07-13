import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { UsersService } from '../users/users.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';
import { JwtPayload } from './interfaces/jwtpayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(
    authInput: AuthInputDto,
  ): Promise<SignInResponseDto | null> {
    const { username, password } = authInput;

    const user = await this.usersService.findByEmail(username);

    if (user instanceof Error || !user) {
      return null;
    }

    const isPasswordValid: boolean =
      await this.passwordHashService.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const payload: JwtPayload = { username: user.email, sub: user.id };
    const accessToken: string = this.jwtService.sign(payload);

    return {
      accessToken: accessToken,
      user: {
        id: user.id,
        username: user.email,
      },
    };
  }

  async getUserFromRequest(request: Request): Promise<User | null> {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ').at(1)?.trim(); // Get the token part after "Bearer"

    if (!token) {
      return null;
    }

    try {
      const decoded: JwtPayload = await this.jwtService.verifyAsync(token);
      const userId = decoded?.sub;

      if (!userId) return null;

      const user: User | Error = await this.usersService.findById(userId);
      return user instanceof Error ? null : user;
    } catch {
      throw new UnauthorizedException(`Invalid token`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';

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

    if (user instanceof Error) {
      return null;
    }

    const isPasswordValid = await this.passwordHashService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    const payload = { username: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken: accessToken,
      user: {
        id: user.id,
        username: user.email,
      },
    };
  }
}

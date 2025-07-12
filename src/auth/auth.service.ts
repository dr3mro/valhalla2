import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async validateUser(
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

    return {
      accessToken: 'dummyAccessToken',
      user: {
        id: user.id,
        username: user.email,
      },
    };
  }
}

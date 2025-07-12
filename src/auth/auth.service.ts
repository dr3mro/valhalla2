import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PasswordHashService } from '../password-hash/password-hash.service';

type AuthInput = {
  username: string;
  password: string;
};

type SignInResponse = {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async validateUser(authInput: AuthInput): Promise<SignInResponse | null> {
    const { username, password } = authInput;

    console.log(`Validating user: ${username} with password: ${password}`);

    const user = await this.usersService.findByEmail(username);

    if (user instanceof Error) {
      console.log('User not found or error occurred:', user.message);
      return null;
    }

    const isPasswordValid = await this.passwordHashService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
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

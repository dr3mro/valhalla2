import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { PasswordHashService } from '../utils/password-hash/password-hash.service';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  let authModule: AuthModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UsersModule],
    })
      .overrideModule(UsersModule)
      .useModule({
        module: UsersModule,
        imports: [],
        providers: [
          {
            provide: PrismaService,
            useValue: {},
          },
          {
            provide: PasswordHashService,
            useValue: {},
          },
        ],
        exports: [PrismaService, PasswordHashService],
      })
      .overrideProvider(JwtService)
      .useValue({})
      .overrideProvider(PasswordHashService)
      .useValue({})
      .compile();

    authModule = module.get<AuthModule>(AuthModule);
  });

  it('should be defined', () => {
    expect(authModule).toBeDefined();
  });
});

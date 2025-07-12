import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  let authModule: AuthModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
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

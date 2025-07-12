import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from './users.module';

describe('UsersModule', () => {
  let usersModule: UsersModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
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
      .compile();

    usersModule = module.get<UsersModule>(UsersModule);
  });

  it('should be defined', () => {
    expect(usersModule).toBeDefined();
  });
});

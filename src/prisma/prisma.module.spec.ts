import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';

describe('PrismaModule', () => {
  let prismaModule: PrismaModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prismaModule = module.get<PrismaModule>(PrismaModule);
  });

  it('should be defined', () => {
    expect(prismaModule).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHashService],
    }).compile();

    service = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should hash and compare password correctly', async () => {
    const password = 'mySecret123';
    const hash = await service.hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await service.comparePasswords(password, hash)).toBe(true);
    expect(await service.comparePasswords('wrong', hash)).toBe(false);
  });
});

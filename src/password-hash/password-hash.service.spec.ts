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
    expect(service).toBeDefined();
    expect(typeof service.hashPassword).toBe('function');
    expect(typeof service.comparePasswords).toBe('function');
    expect(service.hashPassword.length).toBe(1);
    expect(service.comparePasswords.length).toBe(2);
    expect(service.hashPassword).toBeInstanceOf(Function);
    expect(service.comparePasswords).toBeInstanceOf(Function);
    expect(service.hashPassword.name).toBe('hashPassword');
    expect(service.comparePasswords.name).toBe('comparePasswords');
    expect(service.getSaltRounds).toBeDefined();
    expect(typeof service.getSaltRounds).toBe('function');
    expect(service.getSaltRounds()).toBe(10);
    expect(service.getSaltRounds.length).toBe(0);
    expect(service.getSaltRounds).toBeInstanceOf(Function);
    expect(service.getSaltRounds.name).toBe('getSaltRounds');
    expect(await service.hashPassword(`123`)).toBeInstanceOf(Error);
    expect(await service.hashPassword(``)).toBeInstanceOf(Error);
    expect(await service.hashPassword(`qwerasd`)).toBeInstanceOf(Error);
    expect(await service.hashPassword(`short`)).toBeInstanceOf(Error);
    expect(await service.hashPassword(`validPassword123`)).not.toBeInstanceOf(
      Error,
    );
    expect(await service.hashPassword(`validPassword123`)).toBeDefined();
    const password = 'mySecret123';
    const hash = (await service.hashPassword(password)) as string;
    expect(hash).not.toBe(password);
    expect(await service.comparePasswords(password, hash)).toBe(true);
    expect(await service.comparePasswords('wrong', hash)).toBe(false);
  });
});

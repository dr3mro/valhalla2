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
  it('should return the correct salt rounds', () => {
    expect(service.getSaltRounds()).toBe(10);
  });

  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      const password = 'validPassword123';
      const hash = (await service.hashPassword(password)) as string;
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe('string');
    });

    it('should return an error for an empty password', async () => {
      const result = await service.hashPassword('');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Password cannot be empty');
    });

    it('should return an error for a non-string password', async () => {
      const result = await service.hashPassword(123 as any); // Test with non-string
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Password must be a string');
    });

    it('should return an error for a password shorter than 8 characters', async () => {
      const result = await service.hashPassword('short');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe(
        'Password must be at least 8 characters long',
      );
    });
  });

  describe('comparePasswords', () => {
    let hashedPassword: string;
    const password = 'mySecretPassword123';

    beforeEach(async () => {
      hashedPassword = (await service.hashPassword(password)) as string;
    });

    it('should return true for matching passwords', async () => {
      const result = await service.comparePasswords(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const result = await service.comparePasswords('wrongPassword', hashedPassword);
      expect(result).toBe(false);
    });

    it('should throw an error if hashed password is not a string', async () => {
      await expect(
        service.comparePasswords(password, 123 as any),
      ).rejects.toThrow('Error comparing passwords: Illegal arguments: string, number');
    });

    it('should throw an error if password is not a string', async () => {
      await expect(
        service.comparePasswords(123 as any, hashedPassword),
      ).rejects.toThrow('Error comparing passwords: Illegal arguments: number, string');
    });
  });
});

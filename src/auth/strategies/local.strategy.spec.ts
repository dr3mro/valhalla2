import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            authenticate: jest.fn(),
          },
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the authenticated user if authentication is successful', async () => {
      const mockSignInResponse = {
        accessToken: 'some-access-token',
        user: {
          id: 'some-uuid',
          username: 'testuser',
        },
      };
      jest.spyOn(authService, 'authenticate').mockResolvedValue(mockSignInResponse);

      const result = await localStrategy.validate('testuser', 'password');
      expect(result).toEqual(mockSignInResponse);
      expect(authService.authenticate).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password',
      });
    });

    it('should throw UnauthorizedException if authentication fails', async () => {
      jest.spyOn(authService, 'authenticate').mockResolvedValue(null);

      await expect(localStrategy.validate('wronguser', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });
});

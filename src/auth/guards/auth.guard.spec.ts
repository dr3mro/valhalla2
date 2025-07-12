import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthGuard } from './auth.guard';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            getUserFromRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true and attach user to request if user is found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockRequest = { headers: {} } as RequestWithUser;
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      (authService.getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(mockUser);
      expect(authService.getUserFromRequest).toHaveBeenCalledWith(mockRequest);
    });

    it('should return false if user is not found', async () => {
      const mockRequest = { headers: {} } as RequestWithUser;
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      (authService.getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(false);
      expect(mockRequest.user).toBeUndefined();
      expect(authService.getUserFromRequest).toHaveBeenCalledWith(mockRequest);
    });
  });
});

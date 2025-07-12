import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';
import { AuthGuard } from './guards/auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, AuthGuard],
    })
      .overrideProvider(AuthService)
      .useValue({
        signIn: jest.fn(),
        signUp: jest.fn(),
        authenticate: jest.fn(),
      })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a sign-in response on successful login', async () => {
      const mockAuthInput: AuthInputDto = {
        username: 'test@example.com',
        password: 'password123',
      };
      const mockSignInResponse: SignInResponseDto = {
        accessToken: 'mockAccessToken',
        user: { id: '1', username: 'test@example.com' },
      };
      (authService.authenticate as jest.Mock).mockResolvedValue(mockSignInResponse);

      const result = await controller.login(mockAuthInput);
      expect(result).toEqual(mockSignInResponse);
    });

    it('should throw UnauthorizedException on failed login', async () => {
      const mockAuthInput: AuthInputDto = {
        username: 'test@example.com',
        password: 'wrongpassword',
      };
      (authService.authenticate as jest.Mock).mockResolvedValue(null);

      await expect(controller.login(mockAuthInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return the user profile on successful authentication', () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        country: 'USA',
        phone: '1234567890',
        dob: '2000-01-01',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockRequest: RequestWithUser = { user: mockUser } as any;

      const result = controller.getProfile(mockRequest);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not authenticated', () => {
      const mockRequest: RequestWithUser = { user: null } as any;

      expect(() => controller.getProfile(mockRequest)).toThrow(
        UnauthorizedException,
      );
    });
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthInputDto } from './dto/authInputDto';
import { SignInResponseDto } from './dto/signInResponseDto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let passwordHashService: PasswordHashService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: PasswordHashService,
          useValue: {
            hashPassword: jest.fn(),
            comparePasswords: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    passwordHashService = module.get<PasswordHashService>(PasswordHashService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should return a sign-in response on successful authentication', async () => {
      const mockAuthInput: AuthInputDto = {
        username: 'test@example.com',
        password: 'password123',
      };
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
      const mockAccessToken = 'mockAccessToken';

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordHashService.comparePasswords as jest.Mock).mockResolvedValue(
        true,
      );
      (jwtService.sign as jest.Mock).mockReturnValue(mockAccessToken);

      const result = await service.authenticate(mockAuthInput);
      expect(result).toEqual({
        accessToken: mockAccessToken,
        user: { id: mockUser.id, name: mockUser.email },
      });
    });

    it('should return null if user is not found', async () => {
      const mockAuthInput: AuthInputDto = {
        username: 'nonexistent@example.com',
        password: 'password123',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        new Error('User not found'),
      );

      const result = await service.authenticate(mockAuthInput);
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const mockAuthInput: AuthInputDto = {
        username: 'test@example.com',
        password: 'wrongpassword',
      };
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

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordHashService.comparePasswords as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await service.authenticate(mockAuthInput);
      expect(result).toBeNull();
    });
  });

  describe('getUserFromRequest', () => {
    it('should return the user from the request on successful token verification', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { user: 'test@example.com', sub: '1' };
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
      const mockRequest = {
        headers: { authorization: `Bearer ${mockToken}` },
      } as Request;

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockDecoded);
      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserFromRequest(mockRequest);
      expect(result).toEqual(mockUser);
    });

    it('should return null if authorization header is missing', async () => {
      const mockRequest = { headers: {} } as Request;
      const result = await service.getUserFromRequest(mockRequest);
      expect(result).toBeNull();
    });

    it('should return null if token is missing', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer ' },
      } as Request;
      const result = await service.getUserFromRequest(mockRequest);
      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalidToken' },
      } as Request;

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(service.getUserFromRequest(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return null if user is not found in database', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { user: 'test@example.com', sub: '1' };
      const mockRequest = {
        headers: { authorization: `Bearer ${mockToken}` },
      } as Request;

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockDecoded);
      (usersService.findById as jest.Mock).mockResolvedValue(
        new Error('User not found'),
      );

      const result = await service.getUserFromRequest(mockRequest);
      expect(result).toBeNull();
    });
  });

  describe('SignInResponseDto', () => {
    it('should correctly represent the sign-in response structure', () => {
      const signInResponse = new SignInResponseDto();
      signInResponse.accessToken = 'someAccessToken';
      signInResponse.user = {
        id: 'someUserId',
        name: 'test@example.com',
      };

      expect(signInResponse.accessToken).toBe('someAccessToken');
      expect(signInResponse.user.id).toBe('someUserId');
      expect(signInResponse.user.name).toBe('test@example.com');
    });
  });
});

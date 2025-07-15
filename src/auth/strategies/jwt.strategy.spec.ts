import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { User } from '@prisma/client';

const mockUser: User = {
  id: 'some-uuid',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  country: 'USA',
  phone: '1234567890',
  dob: '2000-01-01',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user if a valid token payload is provided and user exists', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate({ sub: mockUser.id, username: mockUser.email });
      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(new Error('User not found'));

      await expect(jwtStrategy.validate({ sub: 'nonexistent-id', username: 'nonexistent@example.com' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if findById returns an Error', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(new Error('Database error'));

      await expect(jwtStrategy.validate({ sub: 'error-id', username: 'error@example.com' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

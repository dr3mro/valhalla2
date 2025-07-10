import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            passwordResetToken: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };
      const expectedUser: User = {
        id: 'some-uuid-1',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createUserDto });
    });

    it('should return an error if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };
      const existingUser: User = {
        id: 'some-uuid-existing',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser);

      const result = await service.create(createUserDto);
      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('User already exists');
      } else {
        fail('Expected an Error instance, but received a User object.');
      }
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 'uuid-1',
          name: 'User 1',
          email: 'user1@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'User 2',
          email: 'user2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const userId = 'some-uuid';
      const user: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(user);

      const result = await service.findOne(userId);
      expect(result).toEqual(user);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return an error if user not found', async () => {
      const userId = 'non-existent-uuid';
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      const result = await service.findOne(userId);
      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('User not found');
      } else {
        fail('Expected an Error instance, but received a User object.');
      }
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 'some-uuid';
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser: User = {
        id: userId,
        name: 'Updated Name',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 'some-uuid';
      const deletedUserMessage = {
        message: `userId: ${userId} deleted successfully`,
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        id: userId,
        name: 'Deleted User',
        email: 'deleted@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(prisma.user, 'delete').mockResolvedValue({
        id: userId,
        name: 'Deleted User',
        email: 'deleted@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.remove(userId);
      if (result instanceof Error) {
        throw new Error('Expected a message object, but received an Error.');
      } else {
        expect(result).toEqual(deletedUserMessage);
      }
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});

import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordHashService } from '../utils/password-hash/password-hash.service';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
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
        PasswordHashService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return bad request if DTO is missing required fields', async () => {
      const createUserDto = { name: '' } as CreateUserDto;
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(new Error('Invalid input'));
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      await controller.create(createUserDto, mockResponse);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid input',
      });
    });

    it('should handle unexpected errors from service', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        country: 'Test Country',
        phone: '1234567890',
        role: Role.USER,
        dob: '2000-01-01',
      };
      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      try {
        await controller.create(createUserDto, mockResponse);
      } catch (e) {
        expect((e as Error).message).toBe('Unexpected error');
      }
    });
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        country: 'Test Country',
        phone: '1234567890',
        role: Role.USER,
        dob: '2000-01-01',
      };
      const expectedUser: Omit<User, 'password'> = {
        id: 'some-uuid',
        name: createUserDto.name,
        email: createUserDto.email,
        country: createUserDto.country,
        phone: createUserDto.phone,
        role: createUserDto.role,
        dob: createUserDto.dob,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedUser as User);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.create(createUserDto, mockResponse);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
    });

    it('should return bad request if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        country: 'Test Country',
        phone: '1234567890',
        role: Role.USER,
        dob: '2000-01-01',
      };

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(new Error('User already exists'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.create(createUserDto, mockResponse);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });
  });

  describe('findAll', () => {
    it('should return empty array if no users exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
    it('should return an array of users', async () => {
      const users: Omit<User, 'password'>[] = [
        {
          id: 'uuid-1',
          name: 'User 1',
          email: 'user1@example.com',
          country: 'Test Country',
          phone: '1234567890',
          role: Role.USER,
          dob: '2000-01-01',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'User 2',
          email: 'user2@example.com',
          country: 'Test Country',
          phone: '1234567890',
          role: Role.USER,
          dob: '2000-01-01',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(users as User[]);

      expect(await controller.findAll()).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const userId = 'some-uuid';
      const user: Omit<User, 'password'> = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        country: 'Test Country',
        phone: '1234567890',
        role: Role.USER,
        dob: '2000-01-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(user as User);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.findOne(userId, mockResponse);

      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return not found if user not found', async () => {
      const userId = 'non-existent-uuid';
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(new Error('User not found'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.findOne(userId, mockResponse);

      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });

  describe('update', () => {
    it('should handle error if user not found', async () => {
      const userId = 'non-existent-uuid';
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(new Error('User not found'));
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      await controller.update(userId, updateUserDto, mockResponse);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should handle error if email already in use', async () => {
      const userId = 'some-uuid';
      const updateUserDto: UpdateUserDto = { email: 'used@example.com' };
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(new Error('Email already in use'));
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      await controller.update(userId, updateUserDto, mockResponse);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already in use',
      });
    });
    it('should update a user', async () => {
      const userId = 'some-uuid';
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser: Omit<User, 'password'> = {
        id: userId,
        name: 'Updated Name',
        email: 'test@example.com',
        country: 'Test Country',
        phone: '1234567890',
        role: Role.USER,
        dob: '2000-01-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser as User);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.update(userId, updateUserDto, mockResponse);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('remove', () => {
    it('should handle error if user not found', async () => {
      const userId = 'non-existent-uuid';
      jest
        .spyOn(service, 'remove')
        .mockResolvedValue(new Error('User not found'));
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      await controller.remove(userId, mockResponse);
      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should handle unexpected errors from service', async () => {
      const userId = 'some-uuid';
      jest.spyOn(service, 'remove').mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      try {
        await controller.remove(userId, mockResponse);
      } catch (e: unknown) {
        expect((e as Error).message).toBe('Unexpected error');
      }
    });
    it('should remove a user', async () => {
      const userId = 'some-uuid';
      const deletedUserMessage = {
        message: `userId: ${userId} deleted successfully`,
      };

      jest.spyOn(service, 'remove').mockResolvedValue(deletedUserMessage);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.remove(userId, mockResponse);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(deletedUserMessage);
    });
  });
});

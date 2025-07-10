import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

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
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };
      const expectedUser: User = {
        id: 'some-uuid',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedUser);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.create(createUserDto, mockResponse);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
    });

    it('should return bad request if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(new Error('User already exists'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.create(createUserDto, mockResponse);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        { id: 'uuid-1', name: 'User 1', email: 'user1@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 'uuid-2', name: 'User 2', email: 'user2@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      expect(await controller.findAll()).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
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
      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findOne(userId, mockResponse);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return not found if user not found', async () => {
      const userId = 'non-existent-uuid';
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(new Error('User not found'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findOne(userId, mockResponse);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
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

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      expect(await controller.update(userId, updateUserDto)).toEqual(
        updatedUser,
      );
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 'some-uuid';
      const deletedUserMessage = { message: `userId: ${userId} deleted successfully` };

      jest.spyOn(service, 'remove').mockResolvedValue(deletedUserMessage);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.remove(userId, mockResponse);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(deletedUserMessage);
    });
  });
});

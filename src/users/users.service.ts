import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordHashService: PasswordHashService,
  ) {}

  async create(data: CreateUserDto): Promise<User | Error> {
    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      return new Error('User already exists');
    }

    const result = await this.passwordHashService.hashPassword(data.password);

    if (result instanceof Error) {
      return result;
    }

    data.password = result;

    const user = await this.prisma.user.create({ data });
    if (!user) {
      return new Error('User creation failed');
    }
    return user;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | Error> {
    const result = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!result) {
      return new Error('User not found');
    }

    return result;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      return new Error('User not found');
    }

    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== id) {
        return new Error('Email already in use');
      }
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      return new Error('User not found');
    }

    const result = await this.prisma.user.delete({ where: { id } });

    if (!result) {
      return new Error(`userId: ${id} delete failure.`);
    }

    return { message: `userId: ${result.id} deleted successfully` };
  }
}

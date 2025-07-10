import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: CreateUserDto): Promise<User | Error> {
    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      return new Error('User already exists');
    }

    const user = await this.prisma.user.create({ data });

    const token = randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), 24); // Token valid for 24 hours

    const passwordResetTokenId = randomUUID();
    await this.prisma.passwordResetToken.create({
      data: {
        id: passwordResetTokenId,
        token,
        userId: user.id,
        expiresAt,
      },
    });

    this.mailService.sendPasswordResetEmail(user.email, token);

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

  update(id: string, data: UpdateUserDto) {
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

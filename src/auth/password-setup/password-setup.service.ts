import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SetPasswordDto } from './dto/set-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordSetupService {
  constructor(private prisma: PrismaService) {}

  async setPassword(setPasswordDto: SetPasswordDto): Promise<void> {
    const { token, password } = setPasswordDto;

    const passwordResetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordResetToken) {
      throw new NotFoundException('Invalid or expired token.');
    }

    if (passwordResetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if an Auth entry already exists for the user
    const existingAuth = await this.prisma.auth.findUnique({
      where: { email: passwordResetToken.user.email },
    });

    if (existingAuth) {
      // Update existing Auth entry
      await this.prisma.auth.update({
        where: { email: passwordResetToken.user.email },
        data: { password: hashedPassword },
      });
    } else {
      // Create new Auth entry
      await this.prisma.auth.create({
        data: {
          email: passwordResetToken.user.email,
          password: hashedPassword,
          userId: passwordResetToken.userId,
        },
      });
    }

    // Invalidate the token
    await this.prisma.passwordResetToken.delete({
      where: { token },
    });
  }
}

import { Module } from '@nestjs/common';
import { PasswordSetupController } from './password-setup/password-setup.controller';
import { PasswordSetupService } from './password-setup/password-setup.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PasswordSetupController],
  providers: [PasswordSetupService],
})
export class AuthModule {}

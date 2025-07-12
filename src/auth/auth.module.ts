import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || '1234567890qwertyuiopasdfghjklzxcvbnm',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' }, // Adjust the expiration time as needed
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordHashService, AuthGuard],
  exports: [AuthService, PasswordHashService],
})
export class AuthModule {}

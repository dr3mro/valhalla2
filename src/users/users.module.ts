import { Module } from '@nestjs/common';
import { PasswordHashService } from 'src/password-hash/password-hash.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PasswordHashService],
  exports: [UsersService],
})
export class UsersModule {}

import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PasswordSetupService } from './password-setup.service';
import { SetPasswordDto } from './dto/set-password.dto';

@Controller('auth')
export class PasswordSetupController {
  constructor(private readonly passwordSetupService: PasswordSetupService) {}

  @Post('set-password')
  @UsePipes(new ValidationPipe())
  async setNewPassword(@Body() setPasswordDto: SetPasswordDto) {
    await this.passwordSetupService.setPassword(setPasswordDto);
    return { message: 'Password set successfully.' };
  }
}

import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.authService.getUserFromRequest(request);
    if (!user) {
      return false;
    }
    request.user = user; // Attach user to request object
    return true;
  }
}

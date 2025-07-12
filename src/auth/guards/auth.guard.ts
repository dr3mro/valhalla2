import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
@Injectable()
export class AuthGuard {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = await this.authService.getUserFromRequest(request);
    if (!user) {
      return false;
    }
    request.user = user; // Attach user to request object
    return true;
  }
}

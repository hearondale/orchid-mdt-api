import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServerGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = (request.headers as any)['authorization'] as
      | string
      | undefined;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const secret = this.config.get<string>('FIVEM_SECRET');

    if (!token || token !== secret) {
      throw new ForbiddenException('Invalid server secret');
    }
    return true;
  }
}

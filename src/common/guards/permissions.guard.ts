import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Officer, Department } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type OfficerWithDept = Officer & { department: Department };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const adminOnly = this.reflector.getAllAndOverride<boolean>(
      ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permission constraints on this route — allow through (covers @Public() routes)
    if (isPublic) return true;

    const officer = context.switchToHttp().getRequest().user as OfficerWithDept;

    if (!officer) return false;

    if (adminOnly) {
      if (!officer.isAdmin)
        throw new ForbiddenException('Admin access required');
      return true;
    }

    // isAdmin bypasses all permission checks
    if (officer.isAdmin) return true;

    // No specific permissions required — authenticated officer is enough
    if (!required || required.length === 0) return true;

    const ok = required.every(
      (p) =>
        officer.department?.access.includes(p) ||
        officer.permissions.includes(p),
    );
    if (!ok) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}

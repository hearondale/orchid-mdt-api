import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Officer, Department } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

type OfficerWithDept = Officer & { department: Department };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const officer = context.switchToHttp().getRequest().user as OfficerWithDept;

    if (!officer) return false;

    // isAdmin bypasses all permission checks
    if (officer.isAdmin) return true;

    const ok = required.every(
      (p) =>
        officer.department?.access.includes(p) ||
        officer.permissions.includes(p),
    );
    if (!ok) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}

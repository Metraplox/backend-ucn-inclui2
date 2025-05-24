import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class DIDDECGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Admin siempre tiene acceso
    if (user.roles && user.roles.includes(UserRole.ADMIN)) return true;

    // Verificar si es personal DIDDEC
    const responsibilities = user.additionalResponsibilities || {};

    // Personal DIDDEC puede ser identificado por:
    // 1. Tener la responsabilidad isDIDDECStaff
    // 2. Tener el rol STAFF (temporal mientras migramos)
    return (
      responsibilities.isDIDDECStaff ||
      (user.roles && user.roles.includes(UserRole.STAFF))
    );
  }
}

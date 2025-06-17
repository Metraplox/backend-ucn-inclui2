import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class HeadsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Admin siempre tiene acceso
    if (user.roles && user.roles.includes(UserRole.COORDINADOR)) return true;

    // Verificar tipos específicos de jefatura si están definidos
    const requiredHeadTypes = this.reflector.get<string[]>(
      'headTypes',
      context.getHandler(),
    );

    const responsibilities = user.additionalResponsibilities || {};

    // Si no se especifican tipos, cualquier jefatura es válida
    if (!requiredHeadTypes || requiredHeadTypes.length === 0) {
      return responsibilities.isDepartmentHead || responsibilities.isCareerHead;
    }

    // Verificar tipos específicos
    for (const type of requiredHeadTypes) {
      if (type === 'department' && responsibilities.isDepartmentHead)
        return true;
      if (type === 'career' && responsibilities.isCareerHead) return true;
    }

    return false;
  }
}

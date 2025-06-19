import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Si no se especifican roles, se permite el acceso por defecto.
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !Array.isArray(user.roles)) {
      return false; // No hay usuario o el formato de roles es incorrecto.
    }

    // Comprueba si el usuario tiene al menos uno de los roles requeridos.
    const hasAccess = requiredRoles.some((role) => user.roles.includes(role));
    
    return hasAccess;
  }
}

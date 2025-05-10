import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { UserPublicData } from '../../users/interfaces/user-public-data.interface'; // O el tipo de req.user

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Si no se especifican roles, se permite el acceso (JwtAuthGuard ya validó el token)
    }
    const { user } = context.switchToHttp().getRequest();

    // Asegurarse que 'user' y 'user.roles' existen.
    // El tipo de 'user' aquí es el que devuelve JwtStrategy.validate(), que es UserPublicData.
    if (!user || !user.roles) {
      return false; // No hay usuario o no tiene roles definidos
    }
    
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * Guard que verifica si el usuario es jefe de departamento o administrador
 * Protege los endpoints que solo deben ser accesibles por jefes de departamento
 */
@Injectable()
export class DepartmentHeadGuard implements CanActivate {
  private readonly logger = new Logger(DepartmentHeadGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('Intento de acceso sin usuario autenticado');
      return false;
    }

    // Verificar si el usuario tiene roles
    if (!user.roles || !Array.isArray(user.roles)) {
      this.logger.warn(
        `Usuario sin roles definidos: ${user.userId || 'ID no disponible'}`,
      );
      return false;
    }

    // El administrador siempre tiene acceso
    if (user.roles.includes(UserRole.COORDINADOR)) {
      this.logger.debug(`Acceso concedido a administrador: ${user.userId}`);
      return true;
    }

    // Verificar si el usuario es jefe de departamento
    if (user.roles.includes(UserRole.JEFE_DEPARTAMENTO)) {
      // Verificar que tenga un departamento asignado
      if (!user.departmentId) {
        this.logger.warn(
          `Jefe de departamento sin departamento asignado: ${user.userId}`,
        );
        return false;
      }

      this.logger.debug(
        `Acceso concedido a jefe de departamento: ${user.userId}, departamento: ${user.departmentId}`,
      );
      return true;
    }

    // Additional check for responsibilities if the role-based check fails
    // This is a fallback for legacy user objects that might have a different structure
    const responsibilities = user.additionalResponsibilities || {};
    if (responsibilities.isDepartmentHead) {
      return true;
    }

    return false;
  }
}

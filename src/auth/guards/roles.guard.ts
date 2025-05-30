import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { UserRole } from '../../users/schemas/user.schema';
import { UserPublicData } from '../../users/interfaces/user-public-data.interface'; // O el tipo de req.user

/**
 * Función para mapear cualquier tipo de rol al UserRole correspondiente
 * Esta función tiene mayor flexibilidad que un objeto literal y evita problemas
 * de propiedades duplicadas
 */
function mapToUserRole(role: Role | UserRole | string): UserRole {
  // Mapeamos los roles del enum Role
  if (role === Role.ADMIN) return UserRole.ADMIN;
  if (role === Role.STAFF) return UserRole.STAFF;
  if (role === Role.STUDENT) return UserRole.STUDENT;
  if (role === Role.TEACHER) return UserRole.TEACHER;
  if (role === Role.CAREER_HEAD) return UserRole.TEACHER;
  if (role === Role.DEPARTMENT_HEAD) return UserRole.TEACHER;
  if (role === Role.DIDDEC) return UserRole.STAFF;
  
  // Mapeamos strings (para compatibilidad)
  if (role === 'admin') return UserRole.ADMIN;
  if (role === 'staff') return UserRole.STAFF;
  if (role === 'student') return UserRole.STUDENT;
  if (role === 'teacher') return UserRole.TEACHER;
  if (role === 'career_head') return UserRole.TEACHER;
  if (role === 'department_head') return UserRole.TEACHER;
  if (role === 'diddec') return UserRole.STAFF;
  
  // Si el rol ya es un UserRole, lo devolvemos tal cual
  if (Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole;
  }
  
  // Si no encontramos un mapeo adecuado, asumimos rol de estudiante por defecto
  // Esto evita errores pero se podría manejar de forma diferente según necesidades
  return UserRole.STUDENT;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(Role | UserRole | string)[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Si no se especifican roles, se permite el acceso (JwtAuthGuard ya validó el token)
    }
    
    const { user } = context.switchToHttp().getRequest();

    // Asegurarse que 'user' y 'user.roles' existen.
    if (!user || !user.roles) {
      return false; // No hay usuario o no tiene roles definidos
    }

    // Comprueba si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some((requiredRole) => {
      // Obtenemos el rol equivalente en UserRole usando nuestra función de mapeo
      const mappedRole = mapToUserRole(requiredRole);
      
      // Verificamos si el usuario tiene ese rol
      return user.roles?.includes(mappedRole);
    });
  }
}

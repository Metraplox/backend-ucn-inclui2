import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema'; // Ajustar ruta si es necesario

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { UserRole } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';
// Modificamos el decorador para aceptar tanto Role como UserRole
export const Roles = (...roles: (Role | UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);

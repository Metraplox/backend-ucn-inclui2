import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class RolesInfoDto {
  @ApiProperty({
    description: 'Roles disponibles en el sistema UCN INCLUI2',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.COORDINADOR,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Administrador principal del sistema',
  })
  description: string;

  @ApiProperty({
    description: 'Permisos principales del rol',
    example: [
      'Gestión completa de usuarios',
      'Acceso a todos los reportes',
      'Configuración del sistema',
    ],
    type: [String],
  })
  permissions: string[];
}

export class SystemRolesDto {
  @ApiProperty({
    description: 'Lista completa de roles del sistema',
    type: [RolesInfoDto],
  })
  roles: RolesInfoDto[];

  @ApiProperty({
    description: 'Información adicional sobre el sistema de roles',
    example:
      'Los roles determinan el acceso a diferentes funcionalidades del sistema',
  })
  info: string;
}

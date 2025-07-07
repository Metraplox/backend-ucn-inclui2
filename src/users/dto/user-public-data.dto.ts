import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';

export class UserPublicDataDto {
  @ApiProperty({
    description: 'ID único del usuario (ObjectId)',
    example: '6372e3e2a3c7e6a2b0f3b3b3',
  })
  _id: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@ucn.cl',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Alberto Perez Gonzalez',
  })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Roles asignados al usuario',
    enum: UserRole,
    isArray: true,
    example: [UserRole.ESTUDIANTE],
  })
  roles: UserRole[];

  @ApiProperty({
    description: 'Indica si la cuenta del usuario está activa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    type: Date,
    example: '2023-01-01T12:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Fecha de la última actualización del usuario',
    type: Date,
    example: '2023-01-02T15:30:00.000Z',
  })
  updatedAt?: Date;

  @ApiProperty({
    description:
      'ID del perfil de estudiante asociado (si el rol es ESTUDIANTE)',
    example: '6372e3e2a3c7e6a2b0f3b3b4',
    required: false,
  })
  studentId?: string;
}

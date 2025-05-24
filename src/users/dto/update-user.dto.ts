import {
  IsEmail,
  IsString,
  MinLength,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nuevo correo electrónico del usuario',
    example: 'usuario.actualizado@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario (mínimo 8 caracteres)',
    example: 'newPassword456',
    required: false,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsOptional()
  password?: string; // Se recibirá la contraseña en texto plano y el servicio se encargará del hashing si se provee

  @ApiProperty({
    description: 'Nuevo nombre completo del usuario',
    example: 'Carlos Alberto Ruiz',
    required: false,
  })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @IsOptional()
  nombreCompleto?: string;

  @ApiProperty({
    description: 'Nuevos roles asignados al usuario.',
    enum: UserRole,
    isArray: true,
    example: [UserRole.ADMIN, UserRole.STAFF],
    required: false,
  })
  @IsArray({ message: 'Los roles deben ser un arreglo.' })
  @IsEnum(UserRole, {
    each: true,
    message: 'Cada rol debe ser un valor válido de UserRole.',
  })
  @IsOptional()
  roles?: UserRole[];

  @ApiProperty({
    description: 'Nuevo estado de activación del usuario.',
    example: false,
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  isActive?: boolean;
}

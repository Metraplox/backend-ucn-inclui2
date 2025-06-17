import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { AdditionalResponsibilitiesDto } from './additional-responsibilities.dto';

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'nuevo.usuario@example.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'password123',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string; // Se recibirá la contraseña en texto plano y el servicio se encargará del hashing

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Carlos Ruiz',
  })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  nombreCompleto: string;

  @ApiProperty({
    description:
      'Roles asignados al usuario. Si no se provee, se asigna "estudiante" por defecto.',
    enum: UserRole,
    isArray: true,
    example: [UserRole.DIDDEC_STAFF],
    required: false,
  })
  @IsArray({ message: 'Los roles deben ser un arreglo.' })
  @IsEnum(UserRole, {
    each: true,
    message: 'Cada rol debe ser un valor válido de UserRole.',
  })
  @IsOptional() // Por defecto, se asignará 'estudiante' si no se provee
  roles?: UserRole[];

  @ApiProperty({
    description: 'Define si el usuario está activo. Por defecto es true.',
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Responsabilidades adicionales del usuario (opcional).',
    type: AdditionalResponsibilitiesDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalResponsibilitiesDto)
  additionalResponsibilities?: AdditionalResponsibilitiesDto;
}

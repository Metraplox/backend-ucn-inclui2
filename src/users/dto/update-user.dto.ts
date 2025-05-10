import { IsEmail, IsString, MinLength, IsArray, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsOptional()
  password?: string; // Se recibirá la contraseña en texto plano y el servicio se encargará del hashing si se provee

  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @IsOptional()
  nombreCompleto?: string;

  @IsArray({ message: 'Los roles deben ser un arreglo.' })
  @IsEnum(UserRole, { each: true, message: 'Cada rol debe ser un valor válido de UserRole.' })
  @IsOptional()
  roles?: UserRole[];

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  isActive?: boolean;
}

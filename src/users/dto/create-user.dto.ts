import { IsEmail, IsString, IsNotEmpty, MinLength, IsArray, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string; // Se recibirá la contraseña en texto plano y el servicio se encargará del hashing

  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  nombreCompleto: string;

  @IsArray({ message: 'Los roles deben ser un arreglo.' })
  @IsEnum(UserRole, { each: true, message: 'Cada rol debe ser un valor válido de UserRole.' })
  @IsOptional() // Por defecto, se asignará 'estudiante' si no se provee
  roles?: UserRole[];

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  isActive?: boolean;
}

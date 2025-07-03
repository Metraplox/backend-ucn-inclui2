import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminChangePasswordDto {
  @ApiProperty({
    description: 'La nueva contraseña para el usuario',
    example: 'nuevaContraseñaSegura123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
} 
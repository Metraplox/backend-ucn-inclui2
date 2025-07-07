import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'La contraseña actual del usuario',
    example: 'password123',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description:
      'La nueva contraseña para la cuenta. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número o caracter especial.',
    example: 'nuevaPasswordSegura456!',
    minLength: 8,
    pattern: '/((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
  })
  @IsString()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número o caracter especial.',
  })
  newPassword: string;
}

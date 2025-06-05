// src/auth/dto/google-login.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'ID Token proporcionado por Google después del login en cliente',
  })
  @IsString()
  idToken: string;
}

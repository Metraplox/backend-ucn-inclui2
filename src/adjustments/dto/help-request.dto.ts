import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class HelpRequestDto {
  @ApiProperty({
    description:
      'Descripción de la ayuda solicitada para implementar el ajuste',
    example:
      'Necesito orientación sobre cómo adaptar mis materiales para este estudiante',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Timestamp de creación de la solicitud',
    example: '2025-05-28T01:01:57-04:00',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}

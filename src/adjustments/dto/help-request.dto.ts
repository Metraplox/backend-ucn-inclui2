import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
}

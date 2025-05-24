import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkAdjustmentReadDto {
  @ApiProperty({
    description: 'Comentarios opcionales del docente sobre el ajuste',
    example: 'Entendido, implementaré este ajuste en mis clases',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

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

  @ApiProperty({
    description: 'Timestamp de marcado como leído',
    example: '2025-05-28T01:01:57-04:00',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  readAt?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class VerifyDocumentDto {
  @ApiProperty({
    description: 'Comentarios opcionales sobre la verificación',
    example: 'Documento verificado correctamente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser texto' })
  comments?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class RelatedToDto {
  @ApiProperty({
    description: 'Tipo del objeto relacionado',
    enum: ['adjustment', 'student', 'course'],
    example: 'adjustment',
  })
  @IsNotEmpty()
  @IsEnum(['adjustment', 'student', 'course'])
  type: string;

  @ApiProperty({
    description: 'ID del objeto relacionado',
    example: '605c72ef9167f86c2cabc123',
  })
  @IsNotEmpty()
  @IsMongoId()
  id: Types.ObjectId;
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '605c72ef9167f86c2cabc123',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Actualización de ajuste',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Se ha actualizado un ajuste para el estudiante Juan Pérez',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    example: 'adjustment_update',
    enum: ['adjustment_update', 'new_student', 'help_request', 'reminder'],
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Semestre académico relacionado',
    example: '2025-1',
  })
  @IsNotEmpty()
  @IsString()
  semester: string;

  @ApiProperty({
    description: 'Referencia al objeto relacionado',
    type: RelatedToDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RelatedToDto)
  relatedTo?: RelatedToDto;

  @ApiProperty({
    description: 'Indica si la notificación ha sido leída',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

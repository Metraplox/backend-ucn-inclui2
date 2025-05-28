import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateAdjustmentDto } from './create-adjustment.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateAdjustmentDto extends PartialType(CreateAdjustmentDto) {
  @ApiProperty({
    description: 'Timestamp de actualización',
    example: '2025-05-28T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  @ApiProperty({
    description: 'Timestamp de creación',
    example: '2025-05-28T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}

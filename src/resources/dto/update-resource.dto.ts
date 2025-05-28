import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @ApiProperty({
    description: 'Flag to mark a resource as archived',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ResourceType } from '../schemas/resource.schema';
import { Types } from 'mongoose';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource title',
    example: 'Guide for visual impairment adjustments',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Resource description',
    example:
      'This guide provides recommendations for students with visual impairment',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
    example: ResourceType.GUIDE,
  })
  @IsNotEmpty()
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({
    description: 'Academic semester (format YYYY-P)',
    example: '2025-1',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'Semester must follow the format YYYY-P where P is 1 or 2',
  })
  semester: string;

  @ApiProperty({
    description: 'Tags for resource categorization',
    example: ['visual', 'impairment', 'guide'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Associated adjustment type IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  adjustmentTypeIds?: Types.ObjectId[];
}

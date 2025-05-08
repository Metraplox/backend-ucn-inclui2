import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class CurrentAdjustmentDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  courseNrc: string;

  @ApiProperty()
  @IsString()
  approvedBy: string;

  @ApiProperty()
  @IsDateString()
  approvedAt: string;

  @ApiProperty()
  @IsBoolean()
  requiresSemesterConfirmation: boolean;

  @ApiProperty()
  @IsDateString()
  expirationDate: string;
}

export class CreateAdjustmentDto {
  @ApiProperty()
  @IsString()
  studentRut: string;

  @ApiProperty({ type: [CurrentAdjustmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurrentAdjustmentDto)
  currentAdjustments: CurrentAdjustmentDto[];
}
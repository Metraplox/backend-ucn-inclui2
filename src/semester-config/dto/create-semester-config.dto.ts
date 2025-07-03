import { IsNotEmpty, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateSemesterConfigDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(2020)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(2)
  semester: number;

  @IsNotEmpty()
  @IsDateString()
  solicitudAjustesInicio: string;

  @IsNotEmpty()
  @IsDateString()
  solicitudAjustesFin: string;

  @IsNotEmpty()
  @IsDateString()
  evaluacionAjustesInicio: string;

  @IsNotEmpty()
  @IsDateString()
  evaluacionAjustesFin: string;

  @IsNotEmpty()
  @IsDateString()
  implementacionAjustesInicio: string;

  @IsNotEmpty()
  @IsDateString()
  implementacionAjustesFin: string;
} 
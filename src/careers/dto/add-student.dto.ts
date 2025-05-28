import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AddStudentDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: '6836440ff617c6b01e71b7f0',
  })
  @IsMongoId({ message: 'El ID del estudiante debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El ID del estudiante no puede estar vacío' })
  readonly studentId: string;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-1',
  })
  @IsString({ message: 'El semestre debe ser texto' })
  @IsNotEmpty({ message: 'El semestre no puede estar vacío' })
  @Matches(/^\d{4}-[1-2]$/, {
    message: 'El semestre debe tener el formato YYYY-P donde P es 1 o 2',
  })
  readonly semestre: string;
}

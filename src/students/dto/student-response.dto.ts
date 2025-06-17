import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class StudentUserDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nombreCompleto: string;
}

class StudentCareerDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class StudentResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  rut: string;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  apellidos: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: StudentUserDto, description: 'Cuenta de usuario asociada' })
  userId: StudentUserDto;

  @ApiProperty({ type: StudentCareerDto, description: 'Carrera que cursa el estudiante' })
  carreraId: StudentCareerDto;

  @ApiProperty()
  semester: string;

  @ApiProperty({ required: false })
  fechaNacimiento?: Date;

  @ApiProperty({ required: false })
  informacionContacto?: string;

  @ApiProperty({ required: false })
  necesidadesEducativasEspeciales?: string;

  @ApiProperty()
  hasDisability: boolean;

  @ApiProperty({ required: false })
  disabilityType?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 
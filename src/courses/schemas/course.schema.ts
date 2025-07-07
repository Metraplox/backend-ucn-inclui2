import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @ApiProperty({
    description: 'ID único del curso (generado por MongoDB)',
    example: '605c72ef9167f86c2cabc789',
  })
  declare _id: string;

  @ApiProperty({
    example: 'MAT101',
    description: 'Código del curso',
  })
  @Prop({ required: true, type: String, index: true })
  code: string;

  @ApiProperty({
    example: 'MAT101-1',
    description: 'Código NRC del curso',
  })
  @Prop({ required: true, type: String, unique: true })
  nrc: string;

  @ApiProperty({
    example: 'Cálculo I',
    description: 'Nombre del curso',
  })
  @Prop({ required: true, type: String })
  nombre: string;

  @ApiProperty({
    example: 'Profesor Martínez',
    description: 'Nombre del profesor del curso',
  })
  @Prop({ required: true, type: String })
  teacherName: string;

  @ApiProperty({
    example: '605c72ef9167f86c2cabc456',
    description: 'ID del profesor',
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @ApiProperty({
    example: 'Departamento de Matemáticas',
    description: 'Departamento académico al que pertenece el curso',
  })
  @Prop({ type: String, index: true })
  departamento: string;

  @ApiProperty({
    example: '2025-1',
    description: 'Semestre académico',
  })
  @Prop({ required: true, type: String, index: true })
  semestre: string;

  @ApiProperty({
    example: ['605c72ef9167f86c2cabc123', '605c72ef9167f86c2cabc124'],
    description: 'IDs de estudiantes inscritos en el curso',
    type: [String],
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }], default: [] })
  students: Types.ObjectId[];

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T12:00:00.000Z',
    readOnly: true,
  })
  declare createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-02T15:30:00.000Z',
    readOnly: true,
  })
  declare updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

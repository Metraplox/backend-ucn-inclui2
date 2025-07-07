import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../users/schemas/user.schema';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class Student {
  @ApiProperty({
    description: 'ID único del estudiante (generado por MongoDB)',
    example: '605c72ef9167f86c2cabc123',
  })
  declare _id: string; // Agregado para Swagger, Mongoose lo maneja internamente

  @ApiProperty({
    description: 'RUT único del estudiante',
    example: '12345678-9',
  })
  @Prop({ required: true, unique: true, trim: true })
  rut: string;

  @ApiProperty({
    description: 'Nombres del estudiante',
    example: 'Juan Alberto',
  })
  @Prop({ required: true, trim: true })
  nombres: string; // Cambiado de name

  @ApiProperty({
    description: 'Apellidos del estudiante',
    example: 'Pérez González',
  })
  @Prop({ required: true, trim: true })
  apellidos: string; // Cambiado de lastName

  @ApiProperty({
    description: 'Correo electrónico único del estudiante',
    example: 'juan.perez@example.com',
  })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @ApiProperty({
    description: 'ID del usuario asociado al estudiante',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'ID de la carrera que cursa el estudiante',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ type: Types.ObjectId, ref: 'Career', required: true })
  carreraId: Types.ObjectId;

  @ApiProperty({
    description: 'Semestre académico actual',
    example: '2025-1',
  })
  @Prop({ required: true, trim: true })
  semester: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del estudiante (YYYY-MM-DD)',
    example: '2000-05-15',
    required: false,
    type: String,
    format: 'date',
  })
  @Prop({ type: Date, required: false })
  fechaNacimiento?: Date;

  @ApiProperty({
    description: 'Información de contacto adicional',
    example: '+56912345678',
    required: false,
  })
  @Prop({ required: false, trim: true })
  informacionContacto?: string;

  @ApiProperty({
    description: 'Necesidades educativas especiales del estudiante',
    example: 'Apoyo visual para lecturas',
    required: false,
  })
  @Prop({ required: false, trim: true })
  necesidadesEducativasEspeciales?: string;

  @ApiProperty({
    description: 'Indica si el estudiante tiene alguna discapacidad',
    example: true,
  })
  @Prop({ default: false })
  hasDisability: boolean;

  @ApiProperty({
    description: 'Tipo de discapacidad del estudiante',
    example: 'Visual',
    required: false,
  })
  @Prop({ required: false, trim: true })
  disabilityType?: string;

  // Ahora usamos directamente semester como campo estándar

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T12:00:00.000Z',
    readOnly: true,
  })
  declare createdAt: Date; // Agregado para Swagger, Mongoose lo maneja con timestamps: true

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-02T15:30:00.000Z',
    readOnly: true,
  })
  declare updatedAt: Date; // Agregado para Swagger, Mongoose lo maneja con timestamps: true
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Crear índices para optimizar consultas
StudentSchema.index({ semester: 1 }); // Índice para consultas por semestre
StudentSchema.index({ carreraId: 1, semester: 1 }); // Índice compuesto para consultas de estudiantes por carrera y semestre
// Nota: email y rut ya tienen índices únicos automáticos por las props unique: true

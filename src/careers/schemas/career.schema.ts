import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CareerDocument = Career & Document;

@Schema({ timestamps: true })
export class Career {
  @ApiProperty({ description: 'Nombre de la carrera' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Código único de la carrera' })
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @ApiProperty({ description: 'ID del jefe de carrera' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  headId: Types.ObjectId;

  @ApiProperty({ description: 'ID del departamento al que pertenece' })
  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @ApiProperty({ description: 'Lista de IDs de estudiantes de la carrera' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }], default: [] })
  studentIds: Types.ObjectId[];

  @ApiProperty({ description: 'Facultad a la que pertenece' })
  @Prop({ required: true, trim: true })
  faculty: string;

  @ApiProperty({ description: 'Sede de la carrera' })
  @Prop({ required: true, trim: true })
  campus: string;

  @ApiProperty({ description: 'Duración en semestres' })
  @Prop({ required: true })
  duration: number;

  @ApiProperty({ description: 'Estado activo de la carrera' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Semestre actual' })
  @Prop({ required: true })
  currentSemester: string;
}

export const CareerSchema = SchemaFactory.createForClass(Career);

CareerSchema.index({ code: 1 });
CareerSchema.index({ headId: 1 });
CareerSchema.index({ departmentId: 1 });
CareerSchema.index({ currentSemester: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department extends Document {
  @ApiProperty({ description: 'Nombre del departamento' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Código único del departamento' })
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @ApiProperty({ description: 'ID del jefe de departamento' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  headId: Types.ObjectId;

  @ApiProperty({ description: 'Lista de IDs de docentes del departamento' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  teacherIds: Types.ObjectId[];

  @ApiProperty({ description: 'Facultad a la que pertenece' })
  @Prop({ required: true, trim: true })
  faculty: string;

  @ApiProperty({ description: 'Sede del departamento' })
  @Prop({ required: true, trim: true })
  campus: string;

  @ApiProperty({ description: 'Estado activo del departamento' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Semestre actual' })
  @Prop({ required: true })
  currentSemester: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ headId: 1 });
DepartmentSchema.index({ currentSemester: 1 });

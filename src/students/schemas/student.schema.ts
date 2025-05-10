import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class Student {
  @Prop({ required: true, unique: true, trim: true }) // trim para limpiar espacios
  rut: string;

  @Prop({ required: true, trim: true })
  nombres: string; // Cambiado de name

  @Prop({ required: true, trim: true })
  apellidos: string; // Cambiado de lastName

  @Prop({ required: true, unique: true, lowercase: true, trim: true }) // lowercase y trim para consistencia
  email: string;

  @Prop({ required: true, trim: true })
  carrera: string;

  @Prop({ type: Date, required: false })
  fechaNacimiento?: Date;

  @Prop({ required: false, trim: true })
  informacionContacto?: string;

  @Prop({ required: false, trim: true })
  necesidadesEducativasEspeciales?: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

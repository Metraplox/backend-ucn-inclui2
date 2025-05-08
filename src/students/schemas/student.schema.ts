import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class Student {
  @Prop({ required: true, unique: true })
  rut: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

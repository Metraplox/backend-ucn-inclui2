import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ required: true, type: String })
  studentRut: string;

  @Prop({ required: true, type: String })
  nrc: string;

  @Prop({ required: true, type: String })
  semester: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Indexes
EnrollmentSchema.index({ studentRut: 1, nrc: 1, semester: 1 }, { unique: true });
EnrollmentSchema.index({ studentRut: 1, semester: 1 });
EnrollmentSchema.index({ nrc: 1, semester: 1 });

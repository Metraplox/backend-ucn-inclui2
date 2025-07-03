import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SemesterConfigDocument = SemesterConfig & Document;

@Schema({ timestamps: true })
export class SemesterConfig {
  @Prop({ required: true, unique: true })
  year: number;

  @Prop({ required: true })
  semester: number; // 1 para el primer semestre, 2 para el segundo

  @Prop({ type: Date, required: true })
  solicitudAjustesInicio: Date;

  @Prop({ type: Date, required: true })
  solicitudAjustesFin: Date;

  @Prop({ type: Date, required: true })
  evaluacionAjustesInicio: Date;

  @Prop({ type: Date, required: true })
  evaluacionAjustesFin: Date;
  
  @Prop({ type: Date, required: true })
  implementacionAjustesInicio: Date;

  @Prop({ type: Date, required: true })
  implementacionAjustesFin: Date;
}

export const SemesterConfigSchema = SchemaFactory.createForClass(SemesterConfig); 
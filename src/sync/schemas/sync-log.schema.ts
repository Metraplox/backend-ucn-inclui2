import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SyncType {
  ESTUDIANTES = 'estudiantes',
  CURSOS = 'cursos',
  INSCRIPCIONES = 'inscripciones',
  ESTUDIANTES_NEE = 'estudiantes_nee',
  INSCRIPCIONES_NEE = 'inscripciones_nee',
}

export enum SyncStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  ERROR = 'error',
}

export type SyncLogDocument = SyncLog & Document;

@Schema({ timestamps: true, collection: 'sync_logs' })
export class SyncLog {
  @Prop({ required: true, enum: SyncType })
  type: SyncType;

  @Prop({ required: true })
  semester: string;

  @Prop({ required: true, enum: SyncStatus })
  status: SyncStatus;

  @Prop({ required: true })
  itemsProcessed: number;

  @Prop({ required: true })
  itemsSynced: number;

  @Prop({ default: null })
  errorMessage?: string;

  @Prop({ type: Object, default: null })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const SyncLogSchema = SchemaFactory.createForClass(SyncLog);

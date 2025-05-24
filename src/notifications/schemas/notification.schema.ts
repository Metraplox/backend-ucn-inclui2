import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({
    description: 'ID único de la notificación',
    example: '605c72ef9167f86c2cabc789',
  })
  declare _id: string;

  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Actualización de ajuste',
  })
  @Prop({ required: true, type: String })
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Se ha actualizado un ajuste para el estudiante Juan Pérez',
  })
  @Prop({ required: true, type: String })
  message: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    example: 'adjustment_update',
    enum: ['adjustment_update', 'new_student', 'help_request', 'reminder'],
  })
  @Prop({ required: true, type: String, index: true })
  type: string;

  @ApiProperty({
    description: 'Semestre académico relacionado',
    example: '2025-1',
  })
  @Prop({ required: true, type: String, index: true })
  semester: string;

  @ApiProperty({
    description: 'Referencia al objeto relacionado',
    type: Object,
  })
  @Prop({
    type: {
      type: { type: String, enum: ['adjustment', 'student', 'course'] },
      id: { type: Types.ObjectId },
    },
  })
  relatedTo: {
    type: string;
    id: Types.ObjectId;
  };

  @ApiProperty({
    description: 'Indica si la notificación ha sido leída',
    example: false,
  })
  @Prop({ type: Boolean, default: false, index: true })
  isRead: boolean;

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

export const NotificationSchema = SchemaFactory.createForClass(Notification);

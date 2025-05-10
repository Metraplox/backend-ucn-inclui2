import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'administrador',
  STAFF = 'personal', // Equivalente a coordinadora o personal de inclusión
  STUDENT = 'estudiante',
  TEACHER = 'docente',
  SUPPORT_UNIT = 'unidad_apoyo', // Para roles como @dea.ucn.cl, @aora.ucn.cl
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, unique: true, required: true, trim: true })
  email: string;

  @Prop({ type: String, required: true })
  password_hash: string; // Se almacena el hash, no la contraseña en texto plano

  @Prop({ type: [{ type: String, enum: UserRole }], required: true, default: [UserRole.STUDENT] })
  roles: UserRole[];

  @Prop({ type: String, required: true, trim: true })
  nombreCompleto: string;

  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  // Timestamps (Mongoose los añade automáticamente, pero los declaramos para el tipado)
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  // Campos adicionales según el documento de diseño final (opcional por ahora, se pueden añadir después)
  // @Prop({ type: String })
  // googleId?: string;

  // @Prop({ type: Date })
  // lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Optimizaciones de índices si es necesario
UserSchema.index({ email: 1 });

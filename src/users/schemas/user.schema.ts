import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'administrador',
  STAFF = 'personal', // Equivalente a coordinadora o personal de inclusión
  STUDENT = 'estudiante',
  TEACHER = 'docente',
  SUPPORT_UNIT = 'unidad_apoyo', // Para roles como @dea.ucn.cl, @aora.ucn.cl
}

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({ description: 'ID único del usuario (generado por MongoDB)', example: '605c72ef9167f86c2cabc789' })
  declare _id: string;

  @ApiProperty({ description: 'Correo electrónico único del usuario', example: 'usuario@example.com' })
  @Prop({ type: String, unique: true, required: true, trim: true })
  email: string;

  // password_hash no se expone en la API
  @Prop({ type: String, required: true })
  password_hash: string; // Se almacena el hash, no la contraseña en texto plano

  @ApiProperty({ description: 'Roles del usuario', enum: UserRole, isArray: true, example: [UserRole.STUDENT] })
  @Prop({ type: [{ type: String, enum: UserRole }], required: true, default: [UserRole.STUDENT] })
  roles: UserRole[];

  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Ana María López' })
  @Prop({ type: String, required: true, trim: true })
  nombreCompleto: string;

  @ApiProperty({ description: 'Indica si el usuario está activo', example: true })
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación del registro', example: '2023-01-01T12:00:00.000Z', readOnly: true })
  @Prop() // Mongoose maneja esto con timestamps: true
  declare createdAt?: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro', example: '2023-01-02T15:30:00.000Z', readOnly: true })
  @Prop() // Mongoose maneja esto con timestamps: true
  declare updatedAt?: Date;

  // Campos adicionales según el documento de diseño final (opcional por ahora, se pueden añadir después)
  // @Prop({ type: String })
  // googleId?: string;

  // @Prop({ type: Date })
  // lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Optimizaciones de índices si es necesario
// UserSchema.index({ email: 1 }); // Eliminado para evitar duplicación, unique:true en @Prop es suficiente

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  // Administración
  COORDINADOR = 'COORDINADOR', // Admin/Cliente del proyecto

  // Personal Especializado
  EDUCADORA_SOCIAL = 'EDUCADORA_SOCIAL', // Entrevistas, registro usuarios
  DIDDEC_STAFF = 'DIDDEC_STAFF', // Personal DIDDEC

  // Académicos con Responsabilidades
  JEFE_CARRERA = 'JEFE_CARRERA', // Gestión académica de carrera
  JEFE_DEPARTAMENTO = 'JEFE_DEPARTAMENTO', // Gestión académica de departamento

  // Personal Académico
  DOCENTE = 'DOCENTE', // Profesores de asignaturas

  // Estudiantes
  ESTUDIANTE = 'ESTUDIANTE', // Estudiantes con NEE
}

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @ApiProperty({
    description: 'ID único del usuario (generado por MongoDB)',
    example: '605c72ef9167f86c2cabc789',
  })
  declare _id: string;

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'usuario@example.com',
  })
  @Prop({ type: String, unique: true, required: true, trim: true })
  email: string;

  // password_hash no se expone en la API
  @Prop({ type: String, required: false })
  password_hash: string; // Se almacena el hash, no la contraseña en texto plano

  @ApiProperty({
    description: 'Roles del usuario',
    enum: UserRole,
    isArray: true,
    example: [UserRole.ESTUDIANTE],
  })
  @Prop({
    type: [String],
    required: true,
    enum: Object.values(UserRole),
    default: [UserRole.ESTUDIANTE],
  })
  roles: UserRole[];

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Ana María López',
  })
  @Prop({ type: String, required: true, trim: true })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: true,
  })
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Responsabilidades adicionales del usuario' })
  @Prop({
    type: {
      isDepartmentHead: { type: Boolean, default: false },
      isCareerHead: { type: Boolean, default: false },
      isDIDDECStaff: { type: Boolean, default: false },
      departmentIds: [{ type: Types.ObjectId, ref: 'Department' }],
      careerIds: [{ type: Types.ObjectId, ref: 'Career' }],
    },
    default: {},
  })
  additionalResponsibilities: {
    isDepartmentHead?: boolean;
    isCareerHead?: boolean;
    isDIDDECStaff?: boolean;
    departmentIds?: Types.ObjectId[];
    careerIds?: Types.ObjectId[];
  };

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T12:00:00.000Z',
    readOnly: true,
  })
  @Prop() // Mongoose maneja esto con timestamps: true
  declare createdAt?: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-02T15:30:00.000Z',
    readOnly: true,
  })
  @Prop() // Mongoose maneja esto con timestamps: true
  declare updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'ID del perfil de estudiante asociado (si aplica)',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ type: Types.ObjectId, ref: 'Student' })
  studentId?: Types.ObjectId;

  @ApiProperty({
    description: 'Indica si el usuario ha completado su perfil',
    example: true,
    default: false,
  })
  @Prop({ type: Boolean, default: false })
  isProfileComplete: boolean;

  // Campos para autenticación externa
  @ApiPropertyOptional({
    description: 'ID de Google (si se registró con Google)',
    example: '123456789012345678901',
  })
  @Prop({ type: String, sparse: true })
  googleId?: string;

  @ApiPropertyOptional({
    description: 'Hashed refresh token',
    example: '$2b$10$...',
  })
  @Prop({ type: String, required: false })
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Fecha del último inicio de sesión',
    example: '2025-05-27T12:00:00.000Z',
  })
  @Prop({ type: Date })
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;

// Optimizaciones de índices si es necesario
// UserSchema.index({ email: 1 }); // Eliminado para evitar duplicación, unique:true en @Prop es suficiente

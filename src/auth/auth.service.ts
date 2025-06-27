// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException, // Importar ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    const userDoc = await this.usersService.findByEmail(email);
    if (
      userDoc &&
      userDoc.password_hash &&
      (await bcrypt.compare(pass, userDoc.password_hash))
    ) {
      const { password_hash, ...result } = userDoc.toObject();
      return result;
    }
    return null;
  }

  async validateGoogleUser(googleId: string, email: string, nombreCompleto: string): Promise<User | null> {
    // 1. Intentar encontrar al usuario por su Google ID.
    let user = await this.usersService.findByGoogleId(googleId);
    if (user) {
      // Usuario encontrado directamente por Google ID.
      // Opcional: Actualizar nombre si el de Google es más reciente o completo.
      if (nombreCompleto && user.nombreCompleto !== nombreCompleto) {
        // Podrías añadir lógica para no sobrescribir un nombre ya bien establecido.
        // Por ahora, actualizamos si es diferente.
        user.nombreCompleto = nombreCompleto; 
        await user.save();
      }
      return user;
    }

    // 2. Si no se encontró por Google ID, intentar encontrar por email para vincular.
    user = await this.usersService.findByEmail(email);

    if (user) {
      // Usuario encontrado por email.
      if (!user.googleId) {
        // El usuario existe pero no tiene un Google ID vinculado. Vincularlo.
        user.googleId = googleId;
        if (nombreCompleto && user.nombreCompleto !== nombreCompleto) {
            // Actualizar nombre si es relevante (ej. si el actual es genérico o vacío)
            user.nombreCompleto = nombreCompleto;
        }
        await user.save();
        return user;
      } else if (user.googleId === googleId) {
        // El Google ID ya está correctamente vinculado. Esto es redundante pero seguro.
        return user;
      } else {
        // ¡Conflicto! El email está registrado pero asociado a un Google ID DIFERENTE.
        // Esto podría indicar un intento de tomar una cuenta o un error.
        console.error(`BACKEND (AuthService): Conflicto de GoogleID para el email ${email}. Registrado: ${user.googleId}, Intento: ${googleId}.`);
        // No se permite la vinculación. Se considera no autorizado.
        // El controlador lanzará UnauthorizedException.
        return null; 
      }
    }

    // 3. Si no se encontró ni por Google ID ni por email, el usuario no existe en el sistema.
    // Como no se deben crear nuevos usuarios, se devuelve null.
    return null;
  }


  async login(user: Omit<User, 'password_hash' | 'googleId'> | UserPublicData | User) {
    // Convertir a objeto plano si es un documento Mongoose
    const userObject = ('toObject' in user && typeof user.toObject === 'function')
                       ? user.toObject()
                       : user;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, googleId, ...userSafeData } = userObject;
    const userIdAsString = userSafeData._id
      ? (typeof userSafeData._id === 'string' ? userSafeData._id : userSafeData._id.toString())
      : ''; 

    const payload = {
      email: userSafeData.email,
      sub: userIdAsString,
      roles: userSafeData.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: userIdAsString,
        email: userSafeData.email,
        nombreCompleto: userSafeData.nombreCompleto,
        roles: userSafeData.roles,
        isActive: userSafeData.isActive,
        createdAt: userSafeData.createdAt, // Incluir si es útil para el frontend
        updatedAt: userSafeData.updatedAt, // Incluir si es útil para el frontend
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<UserPublicData> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw error;
    }
  }
}
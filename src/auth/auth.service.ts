// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException, // Importar ConflictException
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import { TeacherRegisterDto } from './dto/teacher-register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsGateway: NotificationsGateway,
    private configService: ConfigService,
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

  async validateGoogleUser(
    googleId: string,
    email: string,
    nombreCompleto: string,
  ): Promise<User | null> {
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
        console.error(
          `BACKEND (AuthService): Conflicto de GoogleID para el email ${email}. Registrado: ${user.googleId}, Intento: ${googleId}.`,
        );
        // No se permite la vinculación. Se considera no autorizado.
        // El controlador lanzará UnauthorizedException.
        return null;
      }
    }

    // 3. Si no se encontró ni por Google ID ni por email, el usuario no existe en el sistema.
    // Como no se deben crear nuevos usuarios, se devuelve null.
    return null;
  }

  async getTokens(userId: string, email: string, roles: UserRole[]) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async login(
    user: Omit<User, 'password_hash' | 'googleId'> | UserPublicData | User,
  ) {
    // Convertir a objeto plano si es un documento Mongoose
    const userObject =
      'toObject' in user && typeof user.toObject === 'function'
        ? user.toObject()
        : user;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, googleId, ...userSafeData } = userObject;

    const userIdAsString = userSafeData._id
      ? typeof userSafeData._id === 'string'
        ? userSafeData._id
        : userSafeData._id.toString()
      : '';

    if (!userIdAsString) {
      throw new InternalServerErrorException('User ID not found after login');
    }

    const tokens = await this.getTokens(
      userIdAsString,
      userSafeData.email,
      userSafeData.roles,
    );
    await this.updateRefreshToken(userIdAsString, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        _id: userIdAsString,
        email: userSafeData.email,
        nombreCompleto: userSafeData.nombreCompleto,
        roles: userSafeData.roles,
        isActive: userSafeData.isActive,
      },
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async registerTeacher(
    teacherRegisterDto: TeacherRegisterDto,
  ): Promise<UserPublicData> {
    // La validación del formato del email ya la hizo el DTO con class-validator.
    // Aquí podríamos añadir lógica de negocio extra si fuese necesario.

    const createUserDto: CreateUserDto = {
      ...teacherRegisterDto,
      roles: [UserRole.DOCENTE],
      isActive: true, // Los profesores se activan inmediatamente
    };

    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      // El usersService ya lanza ConflictException si el email existe,
      // así que simplemente re-lanzamos el error.
      throw error;
    }
  }

  async register(createUserDto: CreateUserDto): Promise<UserPublicData> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const user = await this.usersService.findById(userId); // Obtiene el documento completo

    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password_hash,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    // El servicio de update ya maneja el hasheo
    await this.usersService.update(userId, {
      password: changePasswordDto.newPassword,
    });

    // Enviar notificación de seguridad
    this.notificationsGateway.sendNotification(userId, {
      title: 'Alerta de Seguridad',
      message:
        'Tu contraseña ha sido cambiada exitosamente. Si no reconoces esta acción, por favor contacta a soporte.',
      type: 'SECURITY_ALERT',
    });

    return true;
  }
}

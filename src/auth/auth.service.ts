import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
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
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.password_hash &&
      (await bcrypt.compare(pass, user.password_hash))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user.toObject(); // user es un Documento Mongoose
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password_hash'> | UserPublicData) {
    // El 'user' que llega aquí ya está validado y no tiene password_hash
    // o es UserPublicData que tampoco lo tiene.
    // Necesitamos el _id y los roles para el payload del JWT.
    // Asegurémonos que 'user' tenga _id (puede ser string o ObjectId) y roles.

    // Asegurar que user._id se maneja correctamente si es ObjectId o string
    const userIdAsString =
      typeof user._id === 'string' ? user._id : (user._id as any).toString();

    const payload = {
      email: user.email,
      sub: userIdAsString,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        // Devolver datos públicos del usuario
        _id: userIdAsString,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        roles: user.roles,
        isActive: user.isActive,
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<UserPublicData> {
    try {
      // UsersService.create ya devuelve UserPublicData (sin password_hash)
      return await this.usersService.create(createUserDto);
    } catch (error) {
      // Errores como ConflictException (email ya existe) serán lanzados por UsersService
      // Aquí podríamos querer loggear o transformar el error si es necesario.
      // Por ahora, dejamos que se propague.
      throw error;
    }
  }
}

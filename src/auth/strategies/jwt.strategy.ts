import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserPublicData } from '../../users/interfaces/user-public-data.interface';
// Importar ConfigService para acceder a JWT_SECRET desde .env
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    // private configService: ConfigService, // Descomentar cuando ConfigModule esté configurado
  ) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<UserPublicData> {
    // payload contendrá { email, sub (userId), roles, iat, exp }
    // Usamos 'sub' (userId) para buscar al usuario y asegurar que existe y está activo.
    const user = await this.usersService.findOneById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token inválido o usuario inactivo.');
    }
    // Devolvemos los datos públicos del usuario.
    // findOneById ya devuelve UserPublicData.
    return user;
  }
}

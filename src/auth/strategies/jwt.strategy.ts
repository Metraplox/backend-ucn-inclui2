import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserPublicData } from '../../users/interfaces/user-public-data.interface';
import { User, UserRole } from '../../users/schemas/user.schema';
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

  async validate(payload: { sub: string; email: string }): Promise<any> {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado o token inválido.',
      );
    }

    // Devolvemos un objeto de usuario "limpio" y enriquecido
    // que estará disponible en `req.user` en todos los controladores protegidos.
    return {
      _id: user._id.toString(),
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      roles: user.roles || [], // Asegurar que roles siempre sea un array
      isActive: user.isActive || false,
      studentId: user.studentId?.toString(), // Añadimos el studentId
    };
  }
}

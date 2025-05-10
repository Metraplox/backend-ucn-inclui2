import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/schemas/user.schema'; // O el tipo que devuelve validateUser

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Por defecto passport-local usa 'username', lo cambiamos a 'email'
  }

  async validate(email: string, pass: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    // 'user' aquí es el objeto devuelto por authService.validateUser,
    // que es Omit<User, 'password_hash'> (un objeto plano sin el hash)
    return user;
  }
}

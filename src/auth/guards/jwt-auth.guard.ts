import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Opcionalmente, se puede sobreescribir handleRequest para personalizar
  // el manejo de errores o la información del usuario.
  // handleRequest(err, user, info, context, status) {
  //   if (err || !user) {
  //     // Aquí se puede loggear 'info' o 'err' para depuración
  //     // Por ejemplo, info puede ser JsonWebTokenError o TokenExpiredError
  //     throw err || new UnauthorizedException('No autorizado o token inválido.');
  //   }
  //   return user; // Devuelve el usuario que JwtStrategy.validate() retornó
  // }

  // canActivate también puede ser sobreescrito si es necesario,
  // por ejemplo, para permitir acceso público a una ruta protegida si no hay token,
  // pero aún así poblar req.user si hay un token válido.
  // Esto se hace a menudo para rutas que tienen comportamiento diferente para
  // usuarios autenticados y anónimos.
}

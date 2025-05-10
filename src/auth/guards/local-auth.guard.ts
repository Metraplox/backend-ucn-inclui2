import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Opcionalmente, se puede sobreescribir canActivate o handleRequest
  // si se necesita lógica personalizada antes o después de la autenticación.
  // Por ejemplo, para iniciar una sesión si se usa passport con sesiones:
  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const result = (await super.canActivate(context)) as boolean;
  //   const request = context.switchToHttp().getRequest();
  //   await super.logIn(request); // Inicia la sesión
  //   return result;
  // }
}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para variables de entorno
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Importar UsersModule para acceder a UsersService
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module'; // Importar
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
// Los Guards generalmente no se listan en 'providers' de un módulo a menos que tengan dependencias
// que necesiten ser resueltas por el inyector de dependencias de ese módulo específico.
// A menudo, son auto-inyectables si no tienen dependencias o si sus dependencias son globales.

@Module({
  imports: [
    UsersModule, // Para que AuthService pueda inyectar UsersService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Asegurar que ConfigModule está disponible
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    ConfigModule, // Importar ConfigModule para que esté disponible para JwtModule.registerAsync y otros servicios
    NotificationsModule, // Añadir a los imports
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    // JwtAuthGuard, LocalAuthGuard, RolesGuard - No es necesario proveerlos aquí si no tienen dependencias complejas
    // o si se usan directamente con @UseGuards() y Nest los instancia.
  ],
  exports: [AuthService, JwtModule], // Exportar AuthService si otros módulos lo necesitan, JwtModule para tests o uso externo
})
export class AuthModule {}

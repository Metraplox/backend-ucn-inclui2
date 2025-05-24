import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para variables de entorno
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Importar UsersModule para acceder a UsersService
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
// Los Guards generalmente no se listan en 'providers' de un módulo a menos que tengan dependencias
// que necesiten ser resueltas por el inyector de dependencias de ese módulo específico.
// A menudo, son auto-inyectables si no tienen dependencias o si sus dependencias son globales.

@Module({
  imports: [
    UsersModule, // Para que AuthService pueda inyectar UsersService
    PassportModule, // PassportModule.register({ defaultStrategy: 'jwt' }) es opcional aquí
    JwtModule.registerAsync({
      imports: [ConfigModule], // Asegurar que ConfigModule está disponible
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
          throw new Error(
            'JWT_SECRET must be defined in environment variables',
          );
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule, // Importar ConfigModule para que esté disponible para JwtModule.registerAsync y otros servicios
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    // JwtAuthGuard, LocalAuthGuard, RolesGuard - No es necesario proveerlos aquí si no tienen dependencias complejas
    // o si se usan directamente con @UseGuards() y Nest los instancia.
  ],
  exports: [AuthService, JwtModule], // Exportar AuthService si otros módulos lo necesitan, JwtModule para tests o uso externo
})
export class AuthModule {}

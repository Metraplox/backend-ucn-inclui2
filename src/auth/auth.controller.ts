// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import { User } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '90627838122-cv4i0d2124tgm1cbh06cbpotuu128b8v.apps.googleusercontent.com'; // REEMPLAZA ESTO SI ES NECESARIO

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
  async login(
    @Request() req: { user: Omit<User, 'password_hash'> },
  ) {
    if (!req.user) {
      console.error('BACKEND: /auth/login - req.user es nulo después de LocalAuthGuard.');
      throw new UnauthorizedException('Usuario no autenticado.');
    }
    return this.authService.login(req.user);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con Google' })
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso con Google.' })
  @ApiResponse({ status: 401, description: 'Token inválido o usuario no autorizado/registrado.' }) // Mensaje de Swagger actualizado
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta (ej. falta idToken).' })
  async loginWithGoogle(@Body() body: GoogleLoginDto) {
    if (!body || !body.idToken) {
      console.error('BACKEND: Error - idToken no encontrado en el body.');
      throw new BadRequestException('idToken es requerido.');
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    let payload: TokenPayload | undefined;

    try {
      const ticket = await client.verifyIdToken({
        idToken: body.idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('BACKEND: Error al verificar el idToken de Google:', error.message);
      if (error.message && (error.message.includes('Invalid token signature') || error.message.includes('Token used too late') || error.message.includes('No pem found for envelope') || error.message.includes('The OAuth client was not found'))) {
        throw new UnauthorizedException(`Token de Google inválido o configuración de cliente incorrecta: ${error.message}`);
      }
      throw new UnauthorizedException(`Fallo al verificar el token de Google: ${error.message}`);
    }

    if (!payload || !payload.email || !payload.sub) {
      console.error('BACKEND: Error - Payload de Google inválido o incompleto.');
      throw new UnauthorizedException('Token de Google verificado pero payload incompleto.');
    }

    const email = payload.email;
    const googleId = payload.sub;
    const nombreCompleto = payload.name || payload.given_name || '';

    try {
      const user = await this.authService.validateGoogleUser(googleId, email, nombreCompleto);
      
      if (!user) {
        // Mensaje de error actualizado y más específico para el frontend
        console.error('BACKEND (Controller): Usuario de Google no encontrado, no vinculado o en conflicto.');
        throw new UnauthorizedException('Tu cuenta de Google no está registrada o no ha podido ser vinculada a una cuenta existente en el sistema. Por favor, contacta al administrador si crees que esto es un error.');
      }
      
      return this.authService.login(user); 

    } catch (error) {
        console.error('BACKEND (Controller): Error durante validateGoogleUser o authService.login posterior:', error.message, error.stack);
        if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
            throw error; // Re-lanzar excepciones HTTP conocidas
        }
        // Para otros errores inesperados
        throw new InternalServerErrorException('Error interno del servidor al procesar el inicio de sesión con Google.');
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.', type: User })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.'})
  @ApiResponse({ status: 409, description: 'Conflicto, el usuario ya existe.' })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserPublicData> {
    return this.authService.register(createUserDto);
  }
}
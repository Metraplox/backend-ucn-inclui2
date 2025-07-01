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
import { User, UserRole } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiExcludeEndpoint } from '@nestjs/swagger';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SystemRolesDto } from './dto/roles.dto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '553729434325-17le89rd3a5aa56r53mpkhmet41n3srr.apps.googleusercontent.com'; // REEMPLAZA ESTO SI ES NECESARIO

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión con credenciales',
    description: 'Autentica un usuario utilizando email y contraseña. Retorna un token JWT para acceder a endpoints protegidos.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Credenciales de acceso del usuario',
    examples: {
      coordinador: {
        value: {
          email: 'coordinadora@ucn.cl',
          password: 'Test123!'
        },
        description: 'Usuario coordinador de prueba'
      },
      educadora: {
        value: {
          email: 'educadora@ucn.cl',
          password: 'Test123!'
        },
        description: 'Usuario educadora social de prueba'
      },
      diddec: {
        value: {
          email: 'diddec@ucn.cl',
          password: 'Test123!'
        },
        description: 'Usuario DIDDEC staff de prueba'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Inicio de sesión exitoso.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'coordinadora@ucn.cl' },
            nombreCompleto: { type: 'string', example: 'María González' },
            roles: { 
              type: 'array',
              items: { type: 'string' },
              example: ['COORDINADOR']
            }
          }
        },
        access_token: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'Token JWT para autenticación'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales incorrectas o usuario no encontrado.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciales incorrectas' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Iniciar sesión con Google OAuth',
    description: 'Autentica un usuario utilizando su cuenta de Google. El usuario debe estar previamente registrado en el sistema o el email debe estar autorizado.'
  })
  @ApiBody({ 
    type: GoogleLoginDto,
    description: 'Token de autenticación de Google'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Inicio de sesión exitoso con Google.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            nombreCompleto: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            googleId: { type: 'string' }
          }
        },
        access_token: { type: 'string', description: 'Token JWT' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o usuario no autorizado/registrado.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Tu cuenta de Google no está registrada o no ha podido ser vinculada a una cuenta existente en el sistema.' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solicitud incorrecta - idToken faltante.' 
  })
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
    //console.log('BACKEND: Payload verificado:', payload);
  } catch (error) {
    //console.error('BACKEND: Error al verificar el idToken de Google:', error.message, error.stack);
    if (
      error.message &&
      (error.message.includes('Invalid token signature') ||
       error.message.includes('Token used too late') ||
       error.message.includes('No pem found for envelope') ||
       error.message.includes('The OAuth client was not found'))
    ) {
      throw new UnauthorizedException(`Token de Google inválido o configuración de cliente incorrecta: ${error.message}`);
    }
    throw new UnauthorizedException(`Fallo al verificar el token de Google: ${error.message}`);
  }

  if (!payload || !payload.email || !payload.sub) {
    //console.error('BACKEND: Error - Payload de Google inválido o incompleto.');
    throw new UnauthorizedException('Token de Google verificado pero payload incompleto.');
  }

  const email = payload.email;
  const googleId = payload.sub;
  const nombreCompleto = payload.name || payload.given_name || '';

  //console.log('BACKEND: email extraído del payload:', email);
  //console.log('BACKEND: googleId extraído del payload:', googleId);
  //console.log('BACKEND: nombreCompleto extraído del payload:', nombreCompleto);

  try {
    const user = await this.authService.validateGoogleUser(googleId, email, nombreCompleto);
    
    if (!user) {
      console.error('BACKEND (Controller): Usuario de Google no encontrado, no vinculado o en conflicto.');
      throw new UnauthorizedException('Tu cuenta de Google no está registrada o no ha podido ser vinculada a una cuenta existente en el sistema. Por favor, contacta al administrador si crees que esto es un error.');
    }
    //console.log(await this.authService.login(user));
    //console.log('BACKEND (Controller): Usuario validado correctamente, haciendo login...');
    return await this.authService.login(user); 

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
  @ApiOperation({ 
    summary: 'Registrar un nuevo usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema. Solo usuarios con roles administrativos pueden acceder a este endpoint en producción.'
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: 'Datos del nuevo usuario a registrar'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente.',
    type: User,
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        email: { type: 'string' },
        nombreCompleto: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos - validación fallida.'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto - El email ya está registrado en el sistema.' 
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserPublicData> {
    return this.authService.register(createUserDto);
  }

  @Post('roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener información de roles del sistema',
    description: 'Retorna la lista completa de roles disponibles en el sistema UCN INCLUI2 con sus descripciones y permisos. Este endpoint es público y no requiere autenticación.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información de roles obtenida exitosamente.',
    type: SystemRolesDto,
    schema: {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', example: 'COORDINADOR' },
              description: { type: 'string', example: 'Administrador principal del sistema' },
              permissions: {
                type: 'array',
                items: { type: 'string' },
                example: ['Gestión completa de usuarios', 'Acceso a todos los reportes', 'Configuración del sistema']
              }
            }
          }
        },
        info: { 
          type: 'string', 
          example: 'Los roles determinan el acceso a diferentes funcionalidades del sistema UCN INCLUI2' 
        }
      }
    }
  })
  async getRoles(): Promise<SystemRolesDto> {
    return {
      roles: [
        {
          role: UserRole.COORDINADOR,
          description: 'Administrador principal del sistema',
          permissions: ['Gestión completa de usuarios', 'Acceso a todos los reportes', 'Configuración del sistema']
        },
        {
          role: UserRole.EDUCADORA_SOCIAL,
          description: 'Gestión de entrevistas y registro de usuarios',
          permissions: ['Registro de estudiantes', 'Gestión de entrevistas', 'Acceso a perfiles estudiantiles']
        },
        {
          role: UserRole.DIDDEC_STAFF,
          description: 'Personal especializado de DIDDEC',
          permissions: ['Gestión de recursos', 'Reportes especializados', 'Configuración de ajustes']
        },
        {
          role: UserRole.JEFE_CARRERA,
          description: 'Gestión académica de carreras',
          permissions: ['Gestión de estudiantes de carrera', 'Reportes académicos', 'Configuración de cursos']
        },
        {
          role: UserRole.JEFE_DEPARTAMENTO,
          description: 'Gestión académica de departamentos',
          permissions: ['Gestión departamental', 'Supervisión de carreras', 'Reportes institucionales']
        },
        {
          role: UserRole.DOCENTE,
          description: 'Profesores de asignaturas',
          permissions: ['Acceso a ajustes de estudiantes', 'Gestión de cursos asignados', 'Reportes de progreso']
        },
        {
          role: UserRole.ESTUDIANTE,
          description: 'Estudiantes con NEE',
          permissions: ['Acceso a perfil personal', 'Visualización de ajustes', 'Gestión de documentos personales']
        }
      ],
      info: 'Los roles determinan el acceso a diferentes funcionalidades del sistema UCN INCLUI2'
    };
  }
}
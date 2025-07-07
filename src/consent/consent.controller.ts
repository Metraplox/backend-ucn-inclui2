import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  Ip,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { Consent } from './schemas/consent.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';

@ApiTags('consent')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consents')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Otorgar o actualizar consentimiento para compartir información',
    description:
      'Permite a los estudiantes otorgar o actualizar su consentimiento para compartir su información con docentes y personal autorizado. Se registra la IP y navegador para auditoría.',
  })
  @ApiBody({
    type: CreateConsentDto,
    description: 'Datos del consentimiento a otorgar',
    examples: {
      consentimiento_completo: {
        value: {
          shareWithTeachers: true,
          shareWithDiddec: true,
          shareDocuments: true,
          additionalNotes: 'Autorizo compartir toda mi información académica',
        },
        description: 'Consentimiento completo',
      },
      consentimiento_parcial: {
        value: {
          shareWithTeachers: true,
          shareWithDiddec: false,
          shareDocuments: false,
          additionalNotes: 'Solo autorizo compartir con mis profesores',
        },
        description: 'Consentimiento parcial',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Consentimiento registrado/actualizado exitosamente.',
    type: Consent,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439012',
        shareWithTeachers: true,
        shareWithDiddec: true,
        shareDocuments: true,
        additionalNotes: 'Autorizo compartir toda mi información',
        consentDate: '2025-06-19T12:00:00.000Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        isActive: true,
        createdAt: '2025-06-19T12:00:00.000Z',
        updatedAt: '2025-06-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - Validación fallida.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Solo estudiantes pueden otorgar consentimiento.',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado en el sistema.',
  })
  async createOrUpdateConsent(
    @Body() createConsentDto: CreateConsentDto,
    @Req() req: ExpressRequest & { user: UserPublicData },
    @Ip() ipAddress: string,
  ): Promise<Consent> {
    const authenticatedUserId = req.user._id;
    const userAgent = req.headers['user-agent'];

    return this.consentService.createOrUpdateConsent(
      authenticatedUserId.toString(),
      createConsentDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('my-consent')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener mi consentimiento actual',
    description:
      'Retorna el estado actual del consentimiento del estudiante autenticado. Si no existe consentimiento previo, retorna null.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consentimiento actual del estudiante obtenido exitosamente.',
    type: Consent,
    schema: {
      nullable: true,
      example: {
        _id: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439012',
        shareWithTeachers: true,
        shareWithDiddec: true,
        shareDocuments: false,
        additionalNotes: 'Solo autorizo compartir información académica',
        consentDate: '2025-06-19T12:00:00.000Z',
        isActive: true,
        revocationDate: null,
        revocationReason: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo estudiantes pueden consultar su consentimiento.',
  })
  async getMyConsent(
    @Req() req: ExpressRequest & { user: UserPublicData },
  ): Promise<Consent | null> {
    const authenticatedUserId = req.user._id;
    return this.consentService.getConsentByUserId(
      authenticatedUserId.toString(),
    );
  }

  @Patch('revoke')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Revocar mi consentimiento',
    description:
      'Permite a un estudiante revocar su consentimiento previamente otorgado. Se debe proporcionar una razón para la revocación.',
  })
  @ApiBody({
    description: 'Razón para revocar el consentimiento',
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: {
          type: 'string',
          description: 'Razón para revocar el consentimiento',
          example: 'Prefiero mantener mi información privada',
          minLength: 10,
          maxLength: 500,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Consentimiento revocado exitosamente.',
    type: Consent,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439012',
        shareWithTeachers: false,
        shareWithDiddec: false,
        shareDocuments: false,
        isActive: false,
        revocationDate: '2025-06-19T12:00:00.000Z',
        revocationReason: 'Prefiero mantener mi información privada',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró consentimiento activo para revocar.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo estudiantes pueden revocar su consentimiento.',
  })
  async revokeMyConsent(
    @Body('reason') reason: string,
    @Req() req: ExpressRequest & { user: UserPublicData },
  ): Promise<Consent> {
    const authenticatedUserId = req.user._id;
    return this.consentService.revokeConsent(
      authenticatedUserId.toString(),
      reason,
    );
  }

  // Endpoints administrativos
  @Get('all')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Listar todos los consentimientos',
    description:
      'Retorna la lista completa de consentimientos del sistema. Solo accesible para coordinadores y educadoras sociales para fines de auditoría y gestión.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los consentimientos obtenida exitosamente.',
    type: [Consent],
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Solo coordinadores y educadoras sociales tienen acceso.',
  })
  async getAllConsents(): Promise<Consent[]> {
    return this.consentService.findAll();
  }

  @Get('stats')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Obtener estadísticas de consentimientos',
    description:
      'Proporciona estadísticas agregadas sobre el estado de los consentimientos en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de consentimientos obtenidas exitosamente.',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: 'Total de estudiantes con registro de consentimiento',
          example: 150,
        },
        withConsent: {
          type: 'number',
          description: 'Estudiantes que autorizaron compartir información',
          example: 120,
        },
        withoutConsent: {
          type: 'number',
          description: 'Estudiantes que no autorizaron o revocaron',
          example: 30,
        },
        percentageWithConsent: {
          type: 'number',
          description: 'Porcentaje de estudiantes que autorizó',
          example: 80,
          minimum: 0,
          maximum: 100,
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
          description: 'Fecha de última actualización de estadísticas',
          example: '2025-06-19T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Usuario no tiene los roles requeridos.',
  })
  async getConsentStats() {
    return this.consentService.getConsentStats();
  }
}

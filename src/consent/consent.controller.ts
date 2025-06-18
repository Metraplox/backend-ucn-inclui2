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
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consents')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Otorgar o actualizar el consentimiento general para compartir información (Solo Estudiantes)',
  })
  @ApiBody({ type: CreateConsentDto })
  @ApiResponse({
    status: 201,
    description: 'Consentimiento registrado/actualizado exitosamente.',
    type: Consent,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
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
    summary: 'Obtener mi consentimiento actual (Solo Estudiantes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Consentimiento actual del estudiante (puede ser nulo si no existe).',
    type: Consent,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async getMyConsent(
    @Req() req: ExpressRequest & { user: UserPublicData },
  ): Promise<Consent | null> {
    const authenticatedUserId = req.user._id;
    return this.consentService.getConsentByUserId(authenticatedUserId.toString());
  }

  @Patch('revoke')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Revocar mi consentimiento (Solo Estudiantes)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Razón para revocar el consentimiento',
          example: 'Prefiero mantener mi información privada'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Consentimiento revocado exitosamente.',
    type: Consent,
  })
  @ApiResponse({ status: 404, description: 'No se encontró consentimiento activo.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async revokeMyConsent(
    @Body('reason') reason: string,
    @Req() req: ExpressRequest & { user: UserPublicData },
  ): Promise<Consent> {
    const authenticatedUserId = req.user._id;
    return this.consentService.revokeConsent(authenticatedUserId.toString(), reason);
  }

  // Endpoints administrativos
  @Get('all')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Listar todos los consentimientos (Solo Coordinador y Educadora Social)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los consentimientos.',
    type: [Consent],
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async getAllConsents(): Promise<Consent[]> {
    return this.consentService.findAll();
  }

  @Get('stats')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Obtener estadísticas de consentimientos (Solo personal autorizado)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de consentimientos.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total de estudiantes con registro' },
        withConsent: { type: 'number', description: 'Estudiantes que autorizaron compartir' },
        withoutConsent: { type: 'number', description: 'Estudiantes que no autorizaron' },
        percentageWithConsent: { type: 'number', description: 'Porcentaje que autorizó' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async getConsentStats() {
    return this.consentService.getConsentStats();
  }
}

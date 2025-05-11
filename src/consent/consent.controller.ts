import { Controller, Post, Body, Get, Param, Req, Ip, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express'; // Renombrado para evitar conflicto con @Req
import { Types } from 'mongoose';

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
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Otorgar o actualizar el consentimiento para un documento (Solo Estudiantes)' })
  @ApiBody({ type: CreateConsentDto })
  @ApiResponse({ status: 201, description: 'Consentimiento registrado/actualizado exitosamente.', type: Consent })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido o ID de estudiante no coincide.' })
  @ApiResponse({ status: 404, description: 'Estudiante o Documento no encontrado.' })
  async giveOrUpdateConsent(
    @Body() createConsentDto: CreateConsentDto,
    @Req() req: ExpressRequest & { user: UserPublicData },
    @Ip() ipAddress: string,
  ): Promise<Consent> {
    const authenticatedStudentUserId = req.user._id; // User._id del estudiante autenticado
    
    const userAgent = req.headers['user-agent'];
    return this.consentService.giveOrUpdateConsent(
      authenticatedStudentUserId.toString(), // Asegurar que es string
      createConsentDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('document/:documentId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener el estado de consentimiento para un documento específico (Solo Estudiantes)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento', type: String })
  @ApiResponse({ status: 200, description: 'Estado del consentimiento (puede ser nulo si no existe).', type: Consent })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  async getConsentForDocument(
    @Param('documentId') documentId: string,
    @Req() req: ExpressRequest & { user: UserPublicData },
  ): Promise<Consent | null> {
    const authenticatedStudentUserId = req.user._id;

    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }

    return this.consentService.getConsentForDocumentByStudent(authenticatedStudentUserId.toString(), documentId);
  }

  @Get('student/my-consents')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener todos los consentimientos otorgados por el estudiante autenticado (Solo Estudiantes)' })
  @ApiResponse({ status: 200, description: 'Lista de consentimientos.', type: [Consent] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async getMyConsents(@Req() req: ExpressRequest & { user: UserPublicData }): Promise<Consent[]> {
    const authenticatedStudentUserId = req.user._id;
    return this.consentService.getConsentsByStudent(authenticatedStudentUserId.toString());
  }
}

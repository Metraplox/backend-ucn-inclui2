import { Controller, Post, Body, Get, Param, Req, Ip, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express'; // Para obtener userAgent e IP
import { Types } from 'mongoose';

import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { Consent } from './schemas/consent.schema';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Asumiendo un AuthGuard

@ApiTags('consents')
@Controller('consents')
// @ApiBearerAuth() // Si se usa autenticación JWT globalmente o en este controlador
// @UseGuards(JwtAuthGuard) // Proteger todas las rutas del controlador
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  @ApiOperation({ summary: 'Otorgar o actualizar el consentimiento para un documento (estudiante autenticado)' })
  @ApiBody({ type: CreateConsentDto })
  @ApiResponse({ status: 201, description: 'Consentimiento registrado/actualizado exitosamente.', type: Consent })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado para dar consentimiento sobre este documento.' })
  @ApiResponse({ status: 404, description: 'Estudiante o Documento no encontrado.' })
  async giveOrUpdateConsent(
    @Body() createConsentDto: CreateConsentDto,
    @Req() req: Request, // Para obtener el usuario autenticado y otros datos del request
    @Ip() ipAddress: string, // NestJS puede inyectar la IP directamente
  ): Promise<Consent> {
    // Placeholder para el ID del estudiante autenticado.
    // En una implementación real, esto vendría de req.user.id o similar, establecido por un AuthGuard.
    // const authenticatedStudentId = req.user?.id; // o req.user?.studentId;
    const authenticatedStudentId = 'placeholder-student-id'; // REEMPLAZAR CON LÓGICA DE AUTENTICACIÓN REAL

    if (!authenticatedStudentId) {
      throw new BadRequestException('No se pudo determinar el ID del estudiante autenticado.');
    }
    
    const userAgent = req.headers['user-agent'];
    return this.consentService.giveOrUpdateConsent(
      authenticatedStudentId,
      createConsentDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('document/:documentId')
  @ApiOperation({ summary: 'Obtener el estado de consentimiento para un documento específico (estudiante autenticado)' })
  @ApiParam({ name: 'documentId', description: 'ID del documento', type: String })
  @ApiResponse({ status: 200, description: 'Estado del consentimiento (puede ser nulo si no existe).', type: Consent })
  @ApiResponse({ status: 400, description: 'ID de documento inválido.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Estudiante o Documento no encontrado (si se valida existencia aquí).' })
  async getConsentForDocument(
    @Param('documentId') documentId: string,
    @Req() req: Request, // Para obtener el usuario autenticado
  ): Promise<Consent | null> {
    // Placeholder para el ID del estudiante autenticado
    // const authenticatedStudentId = req.user?.id;
    const authenticatedStudentId = 'placeholder-student-id'; // REEMPLAZAR

    if (!authenticatedStudentId) {
      throw new BadRequestException('No se pudo determinar el ID del estudiante autenticado.');
    }
    if (!Types.ObjectId.isValid(documentId)) {
      throw new BadRequestException('ID de documento inválido.');
    }

    return this.consentService.getConsentForDocumentByStudent(authenticatedStudentId, documentId);
  }

  @Get('student/my-consents') // Ruta para que un estudiante obtenga todos sus consentimientos
  @ApiOperation({ summary: 'Obtener todos los consentimientos otorgados por el estudiante autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de consentimientos.', type: [Consent] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async getMyConsents(@Req() req: Request): Promise<Consent[]> { // Corregido el nombre del método
    // Placeholder para el ID del estudiante autenticado
    // const authenticatedStudentId = req.user?.id;
    const authenticatedStudentId = 'placeholder-student-id'; // REEMPLAZAR

    if (!authenticatedStudentId) {
      throw new BadRequestException('No se pudo determinar el ID del estudiante autenticado.');
    }
    return this.consentService.getConsentsByStudent(authenticatedStudentId);
  }
}

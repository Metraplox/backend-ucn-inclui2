import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Res,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Resource } from './schemas/resource.schema';
import { User } from '../auth/decorators/user.decorator';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';

@ApiTags('resources')
@Controller(['resources', 'educational-resources'])
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Crear recurso educativo',
    description:
      'Crea un nuevo recurso educativo con archivo adjunto. Solo coordinadores y staff de DIDDEC pueden crear recursos. El archivo se almacena en el servidor y se crean metadatos en la base de datos.',
  })
  @ApiBody({
    description: 'Datos del recurso educativo y archivo',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo del recurso educativo (PDF, DOC, DOCX, PPT, etc.)',
        },
        title: {
          type: 'string',
          description: 'Título descriptivo del recurso',
          example: 'Guía de ajustes para estudiantes con discapacidad visual',
        },
        description: {
          type: 'string',
          description: 'Descripción detallada del contenido del recurso',
          example:
            'Esta guía proporciona recomendaciones específicas para la implementación de ajustes académicos para estudiantes con discapacidad visual',
        },
        resourceType: {
          type: 'string',
          enum: ['guide', 'material', 'template', 'support'],
          description: 'Tipo de recurso educativo',
          example: 'guide',
        },
        semester: {
          type: 'string',
          pattern: '^\\d{4}-[1-2]$',
          description: 'Semestre académico (formato YYYY-P)',
          example: '2025-1',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Etiquetas para categorización del recurso',
          example: ['visual', 'discapacidad', 'ajustes', 'guia'],
        },
        adjustmentTypeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'ObjectIds de tipos de ajustes relacionados',
          example: ['507f1f77bcf86cd799439024', '507f1f77bcf86cd799439025'],
        },
      },
      required: ['file', 'title', 'description', 'resourceType', 'semester'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Recurso educativo creado exitosamente',
    type: Resource,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439023',
        title: 'Guía de ajustes para estudiantes con discapacidad visual',
        description:
          'Esta guía proporciona recomendaciones específicas para la implementación de ajustes académicos',
        resourceType: 'guide',
        filePath: '/uploads/resources/2025-1/guia-discapacidad-visual.pdf',
        originalFilename: 'guia-discapacidad-visual.pdf',
        semester: '2025-1',
        tags: ['visual', 'discapacidad', 'ajustes', 'guia'],
        adjustmentTypeIds: [
          '507f1f77bcf86cd799439024',
          '507f1f77bcf86cd799439025',
        ],
        createdBy: '507f1f77bcf86cd799439013',
        createdAt: '2025-06-19T16:00:00.000Z',
        updatedAt: '2025-06-19T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo requerido o datos inválidos',
    schema: {
      examples: {
        'archivo-faltante': {
          summary: 'Archivo no proporcionado',
          value: {
            statusCode: 400,
            message: 'File is required',
            error: 'Bad Request',
          },
        },
        'semestre-invalido': {
          summary: 'Formato de semestre incorrecto',
          value: {
            statusCode: 400,
            message: 'Semester must follow the format YYYY-P where P is 1 or 2',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo coordinadores y staff DIDDEC',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createResourceDto: CreateResourceDto,
    @User('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.resourcesService.create(createResourceDto, file, userId);
  }

  @Get()
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener recursos educativos',
    description:
      'Obtiene la lista de recursos educativos con filtros opcionales. Todos los roles pueden acceder a los recursos para consulta y descarga.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar por semestre académico (formato YYYY-P)',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$',
    },
  })
  @ApiQuery({
    name: 'resourceType',
    required: false,
    description: 'Filtrar por tipo de recurso',
    enum: ['guide', 'material', 'template', 'support'],
    example: 'guide',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Filtrar por etiquetas (separadas por comas)',
    example: 'visual,discapacidad,ajustes',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recursos educativos',
    type: [Resource],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439023',
          title: 'Guía de ajustes para estudiantes con discapacidad visual',
          description:
            'Recomendaciones específicas para implementación de ajustes académicos',
          resourceType: 'guide',
          filePath: '/uploads/resources/2025-1/guia-discapacidad-visual.pdf',
          originalFilename: 'guia-discapacidad-visual.pdf',
          semester: '2025-1',
          tags: ['visual', 'discapacidad', 'ajustes'],
          adjustmentTypeIds: ['507f1f77bcf86cd799439024'],
          createdBy: '507f1f77bcf86cd799439013',
          createdAt: '2025-06-19T16:00:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439026',
          title: 'Plantilla de evaluación adaptada',
          description:
            'Plantilla para crear evaluaciones con ajustes de tiempo',
          resourceType: 'template',
          filePath: '/uploads/resources/2025-1/plantilla-evaluacion.docx',
          originalFilename: 'plantilla-evaluacion.docx',
          semester: '2025-1',
          tags: ['evaluacion', 'tiempo', 'plantilla'],
          adjustmentTypeIds: ['507f1f77bcf86cd799439027'],
          createdBy: '507f1f77bcf86cd799439013',
          createdAt: '2025-06-18T14:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Requiere rol de staff o docente',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async findAll(
    @Query('semester') semester?: string,
    @Query('resourceType') resourceType?: string,
    @Query('tags') tags?: string,
  ) {
    // Parse tags from comma-separated string if provided
    const tagsArray = tags
      ? tags.split(',').map((tag) => tag.trim())
      : undefined;
    return this.resourcesService.findAll(semester, resourceType, tagsArray);
  }

  @Get('search')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Buscar recursos educativos',
    description:
      'Realiza búsqueda de texto completo en recursos educativos por título, descripción y etiquetas. Opcionalmente filtra por semestre.',
  })
  @ApiQuery({
    name: 'term',
    required: true,
    description:
      'Término de búsqueda (busca en título, descripción y etiquetas)',
    example: 'visual discapacidad',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: 'Filtrar resultados por semestre académico',
    example: '2025-1',
    schema: {
      type: 'string',
      pattern: '^\\d{4}-[1-2]$',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recursos que coinciden con el término de búsqueda',
    type: [Resource],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439023',
          title: 'Guía de ajustes para estudiantes con discapacidad visual',
          description:
            'Recomendaciones específicas para implementación de ajustes académicos para estudiantes con discapacidad visual',
          resourceType: 'guide',
          semester: '2025-1',
          tags: ['visual', 'discapacidad', 'ajustes'],
          originalFilename: 'guia-discapacidad-visual.pdf',
          createdAt: '2025-06-19T16:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Término de búsqueda requerido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Search term is required',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Requiere rol de staff o docente',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async search(
    @Query('term') term: string,
    @Query('semester') semester?: string,
  ) {
    if (!term || term.trim() === '') {
      throw new BadRequestException('Search term is required');
    }
    return this.resourcesService.findBySearchTerm(term, semester);
  }

  @Get('adjustment-type/:id')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener recursos por tipo de ajuste',
    description:
      'Obtiene todos los recursos educativos asociados a un tipo de ajuste específico. Útil para encontrar materiales relacionados con ajustes específicos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del tipo de ajuste',
    example: '507f1f77bcf86cd799439024',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recursos asociados al tipo de ajuste',
    type: [Resource],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439023',
          title: 'Guía de ajustes para estudiantes con discapacidad visual',
          description:
            'Recomendaciones específicas para implementación de ajustes',
          resourceType: 'guide',
          semester: '2025-1',
          tags: ['visual', 'discapacidad'],
          adjustmentTypeIds: ['507f1f77bcf86cd799439024'],
          originalFilename: 'guia-discapacidad-visual.pdf',
          createdAt: '2025-06-19T16:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de tipo de ajuste inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Requiere rol de staff o docente',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async findByAdjustmentType(@Param('id') id: string) {
    return this.resourcesService.findByAdjustmentType(id);
  }

  @Get(':id')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener recurso específico',
    description:
      'Obtiene los detalles completos de un recurso educativo específico por su ID, incluyendo metadatos y referencias.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del recurso educativo',
    example: '507f1f77bcf86cd799439023',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles completos del recurso educativo',
    type: Resource,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439023',
        title: 'Guía de ajustes para estudiantes con discapacidad visual',
        description:
          'Esta guía proporciona recomendaciones específicas para la implementación de ajustes académicos para estudiantes con discapacidad visual, incluyendo adaptaciones de materiales, evaluaciones y metodologías de enseñanza.',
        resourceType: 'guide',
        filePath: '/uploads/resources/2025-1/guia-discapacidad-visual.pdf',
        originalFilename: 'guia-discapacidad-visual.pdf',
        semester: '2025-1',
        tags: ['visual', 'discapacidad', 'ajustes', 'evaluacion', 'materiales'],
        adjustmentTypeIds: [
          '507f1f77bcf86cd799439024',
          '507f1f77bcf86cd799439025',
        ],
        createdBy: '507f1f77bcf86cd799439013',
        createdAt: '2025-06-19T16:00:00.000Z',
        updatedAt: '2025-06-19T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de recurso inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso educativo no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Resource not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Requiere rol de staff o docente',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Get(':id/download')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Descargar archivo de recurso',
    description:
      'Descarga el archivo físico del recurso educativo. Se valida la existencia del archivo en el servidor antes de servir la descarga.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del recurso a descargar',
    example: '507f1f77bcf86cd799439023',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo descargado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'application/msword': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      'application/vnd.ms-powerpoint': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    headers: {
      'Content-Disposition': {
        description: 'Nombre del archivo original',
        schema: {
          type: 'string',
          example: 'attachment; filename="guia-discapacidad-visual.pdf"',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo no encontrado en el servidor',
    schema: {
      example: {
        statusCode: 400,
        message: 'File not found on server',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso no encontrado en base de datos',
    schema: {
      example: {
        statusCode: 404,
        message: 'Resource not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Requiere rol de staff o docente',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async download(@Param('id') id: string, @Res() res: Response) {
    const resource = await this.resourcesService.findOne(id);
    const filePath = path.join(process.cwd(), resource.filePath);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`File not found on server`);
    }

    return res.download(filePath, resource.originalFilename);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({
    summary: 'Actualizar recurso educativo',
    description:
      'Actualiza los metadatos de un recurso educativo existente (título, descripción, etiquetas, etc.). No modifica el archivo físico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del recurso a actualizar',
    example: '507f1f77bcf86cd799439023',
  })
  @ApiBody({
    type: UpdateResourceDto,
    examples: {
      'actualizar-titulo': {
        summary: 'Actualizar título y descripción',
        value: {
          title: 'Guía completa de ajustes para discapacidad visual',
          description:
            'Guía actualizada con nuevas recomendaciones y casos de estudio para implementación de ajustes académicos',
        },
      },
      'actualizar-etiquetas': {
        summary: 'Actualizar etiquetas',
        value: {
          tags: [
            'visual',
            'discapacidad',
            'ajustes',
            'casos-estudio',
            'metodologia',
          ],
        },
      },
      'cambiar-semestre': {
        summary: 'Cambiar semestre',
        value: {
          semester: '2025-2',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso educativo actualizado exitosamente',
    type: Resource,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439023',
        title: 'Guía completa de ajustes para discapacidad visual',
        description:
          'Guía actualizada con nuevas recomendaciones y casos de estudio',
        resourceType: 'guide',
        semester: '2025-1',
        tags: ['visual', 'discapacidad', 'ajustes', 'casos-estudio'],
        adjustmentTypeIds: ['507f1f77bcf86cd799439024'],
        updatedAt: '2025-06-19T17:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId inválido o datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso educativo no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Resource not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo coordinadores y staff DIDDEC',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar recurso educativo',
    description:
      'Elimina permanentemente un recurso educativo de la base de datos y su archivo físico del servidor. Esta acción es irreversible.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId del recurso a eliminar',
    example: '507f1f77bcf86cd799439023',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso educativo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de confirmación',
          example: 'Resource deleted successfully',
        },
      },
      example: {
        message: 'Resource deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de recurso inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso educativo no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Resource not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo coordinadores y staff DIDDEC',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async remove(@Param('id') id: string) {
    await this.resourcesService.remove(id);
    return { message: 'Resource deleted successfully' };
  }
}

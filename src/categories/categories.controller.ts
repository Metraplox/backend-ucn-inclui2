import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Category } from './schemas/category.schema';

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller(['categories', 'nee-categories'])
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Crear categoría de NEE',
    description:
      'Crea una nueva categoría de Necesidades Educativas Especiales (NEE) que puede ser utilizada para clasificar y organizar ajustes razonables. Solo coordinadores y educadoras sociales pueden crear categorías.',
  })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      'tiempo-adicional': {
        summary: 'Categoría de tiempo adicional',
        value: {
          name: 'Tiempo adicional para evaluaciones',
          description:
            'Otorga un 50% de tiempo extra en pruebas y exámenes para estudiantes que lo requieran',
          isActive: true,
        },
      },
      'evaluacion-oral': {
        summary: 'Categoría de evaluación oral',
        value: {
          name: 'Evaluación oral',
          description:
            'Permite reemplazar evaluaciones escritas por evaluaciones orales para estudiantes con dificultades de escritura',
          isActive: true,
        },
      },
      'material-adaptado': {
        summary: 'Categoría de material adaptado',
        value: {
          name: 'Material en formato adaptado',
          description:
            'Proporciona materiales de estudio en formatos alternativos como audio, braille o letra grande',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría de NEE creada exitosamente',
    type: Category,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439028',
        name: 'Tiempo adicional para evaluaciones',
        description:
          'Otorga un 50% de tiempo extra en pruebas y exámenes para estudiantes que lo requieran',
        isActive: true,
        createdAt: '2025-06-19T18:00:00.000Z',
        updatedAt: '2025-06-19T18:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría duplicada',
    schema: {
      examples: {
        'nombre-duplicado': {
          summary: 'Nombre de categoría ya existe',
          value: {
            statusCode: 400,
            message: 'Category with this name already exists',
            error: 'Bad Request',
          },
        },
        'datos-invalidos': {
          summary: 'Datos de entrada inválidos',
          value: {
            statusCode: 400,
            message: [
              'name should not be empty',
              'description should not be empty',
            ],
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener todas las categorías de NEE',
    description:
      'Obtiene la lista completa de categorías de Necesidades Educativas Especiales disponibles en el sistema. Incluye tanto categorías activas como inactivas para referencia completa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de categorías de NEE',
    type: [Category],
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439028',
          name: 'Tiempo adicional para evaluaciones',
          description:
            'Otorga un 50% de tiempo extra en pruebas y exámenes para estudiantes que lo requieran',
          isActive: true,
          createdAt: '2025-06-19T18:00:00.000Z',
          updatedAt: '2025-06-19T18:00:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439029',
          name: 'Evaluación oral',
          description:
            'Permite reemplazar evaluaciones escritas por evaluaciones orales para estudiantes con dificultades de escritura',
          isActive: true,
          createdAt: '2025-06-18T16:30:00.000Z',
          updatedAt: '2025-06-18T16:30:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439030',
          name: 'Material en formato adaptado',
          description:
            'Proporciona materiales de estudio en formatos alternativos como audio, braille o letra grande',
          isActive: true,
          createdAt: '2025-06-17T14:15:00.000Z',
          updatedAt: '2025-06-17T14:15:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439031',
          name: 'Adaptación de espacio físico',
          description:
            'Modificaciones del entorno físico para mejorar la accesibilidad (ubicación, iluminación, etc.)',
          isActive: false,
          createdAt: '2025-06-16T12:00:00.000Z',
          updatedAt: '2025-06-19T10:00:00.000Z',
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
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.DOCENTE,
  )
  @ApiOperation({
    summary: 'Obtener categoría específica',
    description:
      'Obtiene los detalles completos de una categoría de NEE específica por su ID, incluyendo toda la información asociada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId de la categoría de NEE',
    example: '507f1f77bcf86cd799439028',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles completos de la categoría de NEE',
    type: Category,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439028',
        name: 'Tiempo adicional para evaluaciones',
        description:
          'Otorga un 50% de tiempo extra en pruebas y exámenes para estudiantes que lo requieran. Esta adaptación es especialmente útil para estudiantes con trastornos de atención, dislexia o ansiedad.',
        isActive: true,
        createdAt: '2025-06-19T18:00:00.000Z',
        updatedAt: '2025-06-19T18:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de categoría inválido',
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
    description: 'Categoría de NEE no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Category not found',
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
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar categoría de NEE',
    description:
      'Actualiza los datos de una categoría de NEE existente. Permite modificar nombre, descripción y estado activo/inactivo. Solo coordinadores y educadoras sociales pueden realizar actualizaciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId de la categoría a actualizar',
    example: '507f1f77bcf86cd799439028',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    examples: {
      'actualizar-descripcion': {
        summary: 'Actualizar descripción',
        value: {
          description:
            'Otorga un 50% de tiempo extra en pruebas y exámenes. Aplicable a estudiantes con TDAH, dislexia, ansiedad o cualquier condición que afecte la velocidad de procesamiento.',
        },
      },
      'desactivar-categoria': {
        summary: 'Desactivar categoría',
        value: {
          isActive: false,
        },
      },
      'actualizar-completo': {
        summary: 'Actualización completa',
        value: {
          name: 'Tiempo adicional para evaluaciones y trabajos',
          description:
            'Otorga tiempo extra tanto en evaluaciones como en entrega de trabajos según las necesidades específicas del estudiante',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría de NEE actualizada exitosamente',
    type: Category,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439028',
        name: 'Tiempo adicional para evaluaciones y trabajos',
        description:
          'Otorga tiempo extra tanto en evaluaciones como en entrega de trabajos según las necesidades específicas del estudiante',
        isActive: true,
        createdAt: '2025-06-19T18:00:00.000Z',
        updatedAt: '2025-06-19T19:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId inválido, datos inválidos o nombre duplicado',
    schema: {
      examples: {
        'id-invalido': {
          summary: 'ObjectId inválido',
          value: {
            statusCode: 400,
            message: 'Invalid ObjectId',
            error: 'Bad Request',
          },
        },
        'nombre-duplicado': {
          summary: 'Nombre ya existe',
          value: {
            statusCode: 400,
            message: 'Category with this name already exists',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría de NEE no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Category not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar categoría de NEE',
    description:
      'Elimina permanentemente una categoría de NEE del sistema. ADVERTENCIA: Esta acción es irreversible y puede afectar ajustes existentes que usen esta categoría. Se recomienda desactivar en lugar de eliminar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId de la categoría a eliminar',
    example: '507f1f77bcf86cd799439028',
  })
  @ApiResponse({
    status: 204,
    description:
      'Categoría de NEE eliminada exitosamente (sin contenido en respuesta)',
  })
  @ApiResponse({
    status: 400,
    description: 'ObjectId de categoría inválido o categoría en uso',
    schema: {
      examples: {
        'id-invalido': {
          summary: 'ObjectId inválido',
          value: {
            statusCode: 400,
            message: 'Invalid ObjectId',
            error: 'Bad Request',
          },
        },
        'categoria-en-uso': {
          summary: 'Categoría tiene ajustes asociados',
          value: {
            statusCode: 400,
            message:
              'Cannot delete category that has associated adjustments. Please deactivate instead.',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría de NEE no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Category not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado' })
  @ApiResponse({
    status: 403,
    description: 'Rol no autorizado - Solo coordinadores y educadoras sociales',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

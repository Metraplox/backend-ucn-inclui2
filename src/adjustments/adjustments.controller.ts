import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { Adjustment } from './schemas/adjustment.schema';

@ApiTags('Ajustes Razonables') // Mejor etiqueta para agrupación en Swagger UI
@ApiBearerAuth() // Para autenticación JWT (opcional)
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo ajuste razonable', description: 'Registra un nuevo ajuste académico para un estudiante con NEE' })
  @ApiResponse({ status: 201, description: 'Ajuste creado exitosamente', type: Adjustment })
  @ApiResponse({ status: 400, description: 'Datos inválidos o faltantes' })
  @ApiResponse({ status: 409, description: 'Conflicto: El ajuste ya existe para este curso/estudiante' })
  @ApiBody({ type: CreateAdjustmentDto, examples: {
      ejemplo1: {
        value: {
          studentRut: "12345678-9",
          currentAdjustments: [{
            type: "tiempo_extra",
            courseNrc: "MAT101-1",
            approvedBy: "coordinadora@ucn.cl",
            approvedAt: "2025-04-10T00:00:00Z",
            requiresSemesterConfirmation: true,
            expirationDate: "2025-12-31T00:00:00Z"
          }]
        }
      }
    }
  })
  async create(@Body() createAdjustmentDto: CreateAdjustmentDto): Promise<Adjustment> {
    return this.adjustmentsService.create(createAdjustmentDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos los ajustes',
    description: 'Obtiene todos los ajustes razonables registrados con opción de filtrado'
  })
  @ApiQuery({
    name: 'studentRut',
    required: false,
    description: 'Filtrar por RUT de estudiante',
    example: '12345678-9'
  })
  @ApiQuery({
    name: 'courseNrc',
    required: false,
    description: 'Filtrar por código NRC del curso',
    example: 'MAT101-1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de ajustes encontrados',
    type: [Adjustment] 
  })
  async findAll(): Promise<Adjustment[]> {
    return this.adjustmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener ajuste por ID',
    description: 'Recupera un ajuste específico usando su ID de MongoDB'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste en MongoDB',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ajuste encontrado',
    type: Adjustment 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ajuste no encontrado' 
  })
  async findOne(@Param('id') id: string): Promise<Adjustment> {
    const adjustment = await this.adjustmentsService.findOne(id);
    if (!adjustment) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
    return adjustment;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ajuste existente', description: 'Actualiza parcialmente un ajuste razonable' })
  @ApiParam({ name: 'id', description: 'ID del ajuste en MongoDB', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Ajuste actualizado', type: Adjustment })
  @ApiResponse({ status: 404, description: 'Ajuste no encontrado' })
  @ApiBody({ type: UpdateAdjustmentDto, description: 'Solo incluir campos a modificar' })
  async update(@Param('id') id: string, @Body() updateAdjustmentDto: UpdateAdjustmentDto): Promise<Adjustment> {
    const updateAdjustment = await this.adjustmentsService.update(id, updateAdjustmentDto);
    if (!updateAdjustment) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
    return updateAdjustment;
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar ajuste',
    description: 'Elimina permanentemente un ajuste razonable'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ajuste en MongoDB',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Ajuste eliminado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ajuste no encontrado' 
  })
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.adjustmentsService.remove(id);
    if (!result || result.deletedCount === 0) {
      throw new NotFoundException(`Adjustment with ID "${id}" not found`);
    }
  }
}
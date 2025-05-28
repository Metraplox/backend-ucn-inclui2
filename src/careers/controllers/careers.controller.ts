import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { CareersService } from '../careers.service';
import { CreateCareerDto } from '../dto/create-career.dto';
import { UpdateCareerDto } from '../dto/update-career.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('careers')
@ApiBearerAuth()
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Crear una nueva carrera' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La carrera ha sido creada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las carreras' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de carreras recuperada exitosamente',
  })
  findAll(@Query('semestre') semestre?: string) {
    return this.careersService.findAll(semestre);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una carrera por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carrera recuperada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Actualizar una carrera' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carrera actualizada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una carrera' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Carrera eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Obtener estudiantes de una carrera' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de estudiantes recuperada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrera no encontrada',
  })
  getStudents(@Param('id') id: string, @Query('semestre') semestre?: string) {
    return this.careersService.getStudents(id, semestre);
  }
}

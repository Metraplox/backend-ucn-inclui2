import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'; // Importar decoradores de Swagger
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './schemas/student.schema';

@ApiTags('students') // Agrupa los endpoints bajo la etiqueta 'students' en Swagger
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estudiante' })
  @ApiResponse({
    status: 201,
    description: 'El estudiante ha sido creado exitosamente.',
    type: Student,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiBody({ type: CreateStudentDto }) // Describe el cuerpo esperado
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes.',
    type: [Student],
  })
  async findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudiante por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante (ObjectId)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del estudiante.',
    type: Student,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  async findOne(@Param('id') id: string): Promise<Student> {
    const student = await this.studentsService.findOne(id);
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    return student;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estudiante existente' })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Estudiante actualizado exitosamente.',
    type: Student,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const updatedStudent = await this.studentsService.update(
      id,
      updateStudentDto,
    );
    if (!updatedStudent) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    return updatedStudent;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Estándar para DELETE exitoso sin contenido de respuesta
  @ApiOperation({ summary: 'Eliminar un estudiante' })
  @ApiParam({
    name: 'id',
    description: 'ID único del estudiante a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Estudiante eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  async remove(@Param('id') id: string): Promise<void> {
    // Cambiado a Promise<void> para 204
    const result = await this.studentsService.remove(id);
    if (!result || result.deletedCount === 0) {
      // Chequear si Mongoose devolvió un resultado y si algo fue borrado
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    // No se retorna nada en el cuerpo para una respuesta 204
  }
}

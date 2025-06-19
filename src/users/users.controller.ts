import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from './schemas/user.schema'; // Import User schema for response types
import { UserPublicData } from './interfaces/user-public-data.interface';
import { UserPublicDataDto } from './dto/user-public-data.dto'; // Importar el nuevo DTO
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplicar globalmente a todas las rutas de este controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // El endpoint de creación directa de usuarios (si es necesario) también estaría aquí
  // y protegido por roles. Por ahora, el registro es vía AuthController.
  // @Post()
  // @Roles(UserRole.COORDINADOR)
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Crear un nuevo usuario (Admin)' })
  // @ApiBody({ type: CreateUserDto })
  // @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.', type: User })
  // @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  // @ApiResponse({ status: 401, description: 'No autorizado.' })
  // @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  // async create(@Body() createUserDto: CreateUserDto): Promise<UserPublicData> {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener todos los usuarios (Coordinador/Educadora Social)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios con datos públicos.',
    type: [UserPublicDataDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findAll(): Promise<UserPublicData[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF, UserRole.JEFE_CARRERA, UserRole.JEFE_DEPARTAMENTO, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  @ApiOperation({ summary: 'Obtener el perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario actual.',
    type: UserPublicDataDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(
    @CurrentUser() user: UserPublicData,
  ): Promise<UserPublicData> {
    // El objeto user ya contiene toda la información necesaria gracias a la estrategia JWT
    return user;
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener un usuario por su ID (Coordinador/Educadora Social)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario (ObjectId)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del usuario.',
    type: UserPublicDataDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findOne(@Param('id') id: string): Promise<UserPublicData> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar un usuario existente (Coordinador/Educadora Social)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente.',
    type: UserPublicDataDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserPublicData> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario (Coordinador)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async remove(@Param('id') id: string): Promise<void> {
    // Cambiado el tipo de retorno
    await this.usersService.remove(id);
  }
}

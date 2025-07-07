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
  Post,
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
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplicar globalmente a todas las rutas de este controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario (Admin)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente.',
    type: UserPublicDataDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserPublicData> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description:
      'Retorna la lista completa de usuarios registrados en el sistema con sus datos públicos. Solo accesible para coordinadores y educadoras sociales.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios con datos públicos obtenida exitosamente.',
    type: [UserPublicDataDto],
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido - Usuario no tiene los roles requeridos (COORDINADOR o EDUCADORA_SOCIAL).',
  })
  async findAll(): Promise<UserPublicData[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @Roles(
    UserRole.COORDINADOR,
    UserRole.EDUCADORA_SOCIAL,
    UserRole.DIDDEC_STAFF,
    UserRole.JEFE_CARRERA,
    UserRole.JEFE_DEPARTAMENTO,
    UserRole.DOCENTE,
    UserRole.ESTUDIANTE,
  )
  @ApiOperation({
    summary: 'Obtener el perfil del usuario actual',
    description:
      'Retorna la información del perfil del usuario autenticado basándose en el token JWT. Accesible para todos los roles del sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario actual obtenido exitosamente.',
    type: UserPublicDataDto,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        email: 'coordinadora@ucn.cl',
        nombreCompleto: 'María González',
        roles: ['COORDINADOR'],
        isActive: true,
        additionalResponsibilities: {
          isDepartmentHead: true,
          departmentIds: ['507f1f77bcf86cd799439012'],
        },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-06-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  async getProfile(
    @CurrentUser() user: UserPublicData,
  ): Promise<UserPublicData> {
    // El objeto user ya contiene toda la información necesaria gracias a la estrategia JWT
    return user;
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Obtener un usuario por su ID',
    description:
      'Busca y retorna la información de un usuario específico utilizando su ID único de MongoDB.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario (ObjectId de MongoDB)',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del usuario encontrados exitosamente.',
    type: UserPublicDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Usuario no tiene los roles requeridos.',
  })
  async findOne(@Param('id') id: string): Promise<UserPublicData> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)
  @ApiOperation({
    summary: 'Actualizar un usuario existente',
    description:
      'Actualiza parcialmente la información de un usuario. Solo se actualizan los campos enviados en el body.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateUserDto,
    description:
      'Campos del usuario a actualizar. Solo incluir los campos que se desean modificar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente.',
    type: UserPublicDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos - Validación fallida.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Usuario no tiene los roles requeridos.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserPublicData> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un usuario',
    description:
      'Elimina permanentemente un usuario del sistema. Esta acción es irreversible y solo puede ser ejecutada por coordinadores.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description:
      'Usuario eliminado exitosamente. Sin contenido en la respuesta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado con el ID especificado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Solo los coordinadores pueden eliminar usuarios.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    // Cambiado el tipo de retorno
    await this.usersService.remove(id);
  }

  @Post(':id/admin-change-password')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar la contraseña de un usuario (Admin)',
    description:
      'Permite a un coordinador establecer una nueva contraseña para cualquier usuario. Esta es una operación privilegiada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario cuya contraseña se cambiará',
    type: String,
  })
  @ApiBody({ type: AdminChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente.',
  })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async adminChangePassword(
    @Param('id') id: string,
    @Body() adminChangePasswordDto: AdminChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.adminSetPassword(id, adminChangePasswordDto);
    return { message: 'Contraseña actualizada exitosamente.' };
  }

  @Patch(':id/roles')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar los roles de un usuario (Admin)',
    description:
      'Permite a un coordinador actualizar la lista de roles de un usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: String,
  })
  @ApiBody({
    description: 'Lista de roles a asignar al usuario',
    type: [String],
    enum: UserRole,
  })
  @ApiResponse({ status: 200, description: 'Roles actualizados exitosamente.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async updateRoles(
    @Param('id') id: string,
    @Body() roles: UserRole[],
  ): Promise<UserPublicData> {
    return this.usersService.update(id, { roles });
  }

  @Get(':id/roles')
  @Roles(UserRole.COORDINADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener los roles de un usuario',
    description:
      'Permite a un coordinador obtener la lista de roles de un usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Roles obtenidos exitosamente.',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        roles: {
          type: 'array',
          items: { type: 'string', enum: Object.values(UserRole) },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async getUserRoles(
    @Param('id') id: string,
  ): Promise<{ userId: string; roles: UserRole[] }> {
    const user = await this.usersService.findById(id);
    return {
      userId: user._id.toString(),
      roles: user.roles || [],
    };
  }
}

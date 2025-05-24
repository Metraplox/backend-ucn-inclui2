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
  // @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los usuarios (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.', type: [User] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findAll(): Promise<UserPublicData[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario actual.',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(
    @CurrentUser() user: UserPublicData,
  ): Promise<UserPublicData> {
    // El objeto user ya contiene toda la información necesaria gracias a la estrategia JWT
    return user;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN) // Solo admin puede ver perfiles de otros usuarios por ID
  @ApiOperation({ summary: 'Obtener un usuario por su ID (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario (ObjectId)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del usuario.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Rol no permitido.' })
  async findOne(@Param('id') id: string): Promise<UserPublicData> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Por ahora, solo admin.
  @ApiOperation({ summary: 'Actualizar un usuario existente (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente.',
    type: User,
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
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario (Admin)' })
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

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UserPublicData } from './interfaces/user-public-data.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplicar globalmente a todas las rutas de este controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // El endpoint de creación directa de usuarios (si es necesario) también estaría aquí
  // y protegido por roles. Por ahora, el registro es vía AuthController.
  // @Post()
  // @Roles(UserRole.ADMIN)
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createUserDto: CreateUserDto): Promise<UserPublicData> {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<UserPublicData[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN) // Por ahora, solo admin. Se podría añadir lógica para que un usuario vea su propio perfil.
  async findOne(@Param('id') id: string): Promise<UserPublicData> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Por ahora, solo admin.
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserPublicData> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ deleted: boolean; message?: string }> {
    return this.usersService.remove(id);
  }
}

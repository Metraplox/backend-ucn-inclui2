import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';
import { User } from '../users/schemas/user.schema'; // Para el tipo de req.user

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: { user: Omit<User, 'password_hash'> }) { // req.user es establecido por LocalAuthGuard/LocalStrategy
    // El body con LoginDto es manejado automáticamente por LocalStrategy a través de LocalAuthGuard.
    // No necesitamos loginDto como parámetro explícito aquí si LocalAuthGuard está activo.
    // Sin embargo, para que Swagger genere la documentación del body, se puede dejar @Body() loginDto: LoginDto,
    // pero no se usaría directamente en el código del método si LocalAuthGuard está activo.
    // Por simplicidad y claridad con el guard, lo removemos del signature si el guard se encarga.
    // Si se deja, asegurarse que no cause confusión.
    if (!req.user) { // Doble chequeo, aunque LocalAuthGuard debería lanzar error si no hay user.
        throw new UnauthorizedException('Usuario no autenticado después del guard.');
    }
    return this.authService.login(req.user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<UserPublicData> {
    return this.authService.register(createUserDto);
  }

  // Podría haber un endpoint GET /auth/profile para obtener el perfil del usuario autenticado (usando JwtAuthGuard)
  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user; // req.user es establecido por JwtStrategy
  // }
}

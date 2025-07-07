import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SemesterConfigService } from './semester-config.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('semester-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SemesterConfigController {
  constructor(private readonly semesterConfigService: SemesterConfigService) {}

  // Proteger endpoints con roles, ej:
  // @Post()
  // @Roles(Role.Coordinador)
  // create(@Body() createDto: ...) { ... }
}

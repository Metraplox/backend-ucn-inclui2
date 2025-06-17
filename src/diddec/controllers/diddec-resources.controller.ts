import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Res,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ResourcesService } from '../../resources/resources.service';
import { CreateResourceDto } from '../../resources/dto/create-resource.dto';
import { UpdateResourceDto } from '../../resources/dto/update-resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { User } from '../../auth/decorators/user.decorator';
import { Response } from 'express';

@ApiTags('DIDDEC Resources')
@Controller('diddec/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DiddecResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new support resource for adjustments' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        resourceType: { type: 'string' },
        semester: { type: 'string' },
        tags: { 
          type: 'array',
          items: { type: 'string' }
        },
        adjustmentTypeIds: {
          type: 'array',
          items: { type: 'string' }
        }
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The resource has been successfully created.',
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createResourceDto: CreateResourceDto,
    @User('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo es obligatorio');
    }
    return this.resourcesService.create(createResourceDto, file, userId);
  }

  @Get()
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.DOCENTE)
  @ApiOperation({ summary: 'List all support resources with optional filters' })
  @ApiQuery({ name: 'semester', required: false, description: 'Filter by semester (YYYY-P)' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma separated)' })
  @ApiResponse({
    status: 200,
    description: 'List of resources',
  })
  async findAll(
    @Query('semester') semester?: string,
    @Query('resourceType') resourceType?: string,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    return this.resourcesService.findAll(semester, resourceType, tagsArray);
  }

  @Get('search')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Search resources by term' })
  @ApiQuery({ name: 'term', required: true, description: 'Search term' })
  @ApiQuery({ name: 'semester', required: false, description: 'Filter by semester (YYYY-P)' })
  @ApiResponse({
    status: 200,
    description: 'List of resources matching search term',
  })
  async search(
    @Query('term') term: string,
    @Query('semester') semester?: string,
  ) {
    if (!term || term.trim() === '') {
      throw new BadRequestException('El término de búsqueda es obligatorio');
    }
    return this.resourcesService.findBySearchTerm(term, semester);
  }

  @Get('adjustment-type/:id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Get resources by adjustment type ID' })
  @ApiResponse({
    status: 200,
    description: 'List of resources for the adjustment type',
  })
  async findByAdjustmentType(@Param('id') id: string) {
    return this.resourcesService.findByAdjustmentType(id);
  }

  @Get(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Get a resource by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found resource',
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Get(':id/download')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Download a resource file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Resource or file not found' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const resource = await this.resourcesService.findOne(id);
    return res.download(resource.filePath, resource.originalFilename);
  }

  @Patch(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Update a resource' })
  @ApiResponse({
    status: 200,
    description: 'The resource has been successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINADOR, UserRole.DIDDEC_STAFF)
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiResponse({ status: 200, description: 'The resource has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.resourcesService.remove(id);
    return { message: 'Recurso eliminado exitosamente' };
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeController } from '@nestjs/swagger';

@ApiTags('Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Endpoint de bienvenida',
    description: 'Retorna un mensaje de bienvenida del sistema UCN INCLUI2. Útil para verificar que la API está funcionando.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensaje de bienvenida',
    schema: {
      type: 'string',
      example: 'Bienvenido a UCN INCLUI2 API'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Verificación de salud del sistema',
    description: 'Endpoint para monitoreo y verificación del estado del servicio. Retorna el estado actual y timestamp.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del sistema',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          example: 'ok',
          description: 'Estado del servicio' 
        },
        timestamp: { 
          type: 'string', 
          format: 'date-time',
          example: '2025-06-19T12:00:00.000Z',
          description: 'Timestamp ISO 8601 del momento de la verificación' 
        }
      }
    }
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}

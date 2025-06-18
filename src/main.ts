import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Iniciando aplicación...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  
  // Configuración de CORS
  const frontendUrl = configService.get('FRONTEND_URL') || '*';
  app.enableCors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  
  logger.log(`CORS configurado para: ${frontendUrl}`);

  // Swagger - Configuración completa
  const config = new DocumentBuilder()
    .setTitle('UCN INCLUI2 API')
    .setDescription(`
      API REST para la gestión integral de estudiantes con Necesidades Educativas Especiales (NEE) en la Universidad Católica del Norte.
      
      ## Roles del Sistema:
      - **COORDINADOR**: Administrador principal del sistema
      - **EDUCADORA_SOCIAL**: Gestión de entrevistas y registro de usuarios
      - **DIDDEC_STAFF**: Personal especializado de DIDDEC
      - **JEFE_CARRERA**: Gestión académica de carreras
      - **JEFE_DEPARTAMENTO**: Gestión académica de departamentos
      - **DOCENTE**: Profesores de asignaturas
      - **ESTUDIANTE**: Estudiantes con NEE
      
      ## Autenticación:
      La API utiliza JWT Bearer tokens. Para acceder a endpoints protegidos, incluye el header:
      \`Authorization: Bearer <tu-token>\`
    `)
    .setVersion('1.0')
    .setContact('Equipo UCN INCLUI2', '', 'soporte@ucn.cl')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT obtenido del endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    // Tags organizados por módulos
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios del sistema')
    .addTag('students', 'Gestión de estudiantes con NEE')
    .addTag('adjustments', 'Ajustes académicos y adaptaciones')
    .addTag('staff-adjustments', 'Gestión de ajustes por personal')
    .addTag('categories', 'Categorías de ajustes académicos')
    .addTag('departments', 'Gestión de departamentos académicos')
    .addTag('Jefes de Departamento', 'Operaciones específicas para jefes de departamento')
    .addTag('careers', 'Gestión de carreras universitarias')
    .addTag('career-students', 'Relación estudiantes-carreras')
    .addTag('Jefes de Carrera', 'Operaciones específicas para jefes de carrera')
    .addTag('courses', 'Gestión de cursos y asignaturas')
    .addTag('academic-history', 'Historial académico de estudiantes')
    .addTag('documents', 'Gestión de documentos del sistema')
    .addTag('consent', 'Consentimientos y autorizaciones')
    .addTag('notifications', 'Sistema de notificaciones')
    .addTag('Resources', 'Recursos educativos y materiales')
    .addTag('DIDDEC', 'Operaciones del departamento DIDDEC')
    .addTag('DIDDEC Resources', 'Recursos específicos de DIDDEC')
    .addTag('DIDDEC Reports', 'Reportes y estadísticas de DIDDEC')
    .addTag('sync', 'Sincronización de datos externos')
    .addTag('hawaii-sync', 'Sincronización con sistema Hawaii')
    .addTag('heads', 'Gestión de jefaturas')
    .addTag('diddec', 'Operaciones específicas de DIDDEC')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'UCN INCLUI2 API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { background-color: #1976d2; }
      .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'); }
    `,
  });

  // Registrar interceptor de respuesta globalmente
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Habilitar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: false, // No lanza error si hay propiedades no permitidas, solo las elimina
      transform: true, // Transforma el payload al tipo del DTO
      transformOptions: {
        enableImplicitConversion: true, // Permite conversiones implícitas de tipos
      },
    }),
  );

  const port = configService.get('PORT') || 3002;
  await app.listen(port);
  
  logger.log(`Servidor iniciado en: http://localhost:${port}`);
  logger.log(`Swagger disponible en: http://localhost:${port}/api`);
  logger.log(`Entorno: ${configService.get('NODE_ENV') || 'development'}`);
}

bootstrap().catch(err => {
  console.error('Error al iniciar la aplicación:', err);
});

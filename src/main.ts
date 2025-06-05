import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

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

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('INCLUI2 API')
    .setDescription('API para la gestión de estudiantes con necesidades')
    .setVersion('1.0')
    .addTag('students', 'Operaciones relacionadas con estudiantes')
    .addTag('adjustments', 'Operaciones relacionadas con ajustes')
    .addTag('users', 'Operaciones relacionadas con usuarios')
    .addTag('auth', 'Operaciones relacionadas con autenticación')
    .addTag('consent', 'Operaciones relacionadas con consentimientos')
    .addTag('documents', 'Operaciones relacionadas con documentos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Endpoint para la UI: /api

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

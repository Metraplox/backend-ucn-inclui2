import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Importar Swagger
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: '*', // Permite todas las solicitudes de origen. Cambia esto en producción.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

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
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma el payload al tipo del DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

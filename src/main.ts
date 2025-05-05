import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Importar Swagger
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('UCN DGE API')
    .setDescription('API para la gestión de estudiantes y otros módulos de la DGE.')
    .setVersion('1.0')
    .addTag('students', 'Operaciones relacionadas con estudiantes') // Tag para agrupar endpoints
    // Puedes agregar más tags para otros módulos
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Endpoint para la UI: /api

  // Habilitar ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    transform: true, // Transforma el payload al tipo del DTO
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

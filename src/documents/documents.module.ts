import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import *  as fs from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentEntity, DocumentSchema } from './schemas/document.schema';

// Configuración de almacenamiento de Multer
const UPLOAD_LOCATION = process.env.UPLOAD_LOCATION || path.join(__dirname, '..', '..', 'uploads');

// Asegurar que el directorio de uploads exista al iniciar el módulo
try {
  if (!fs.existsSync(UPLOAD_LOCATION)) {
    fs.mkdirSync(UPLOAD_LOCATION, { recursive: true });
  }
} catch (error) {
  console.error('Error creating upload directory on module load:', error);
  // Podría ser preferible lanzar un error aquí para detener el inicio de la app si el dir es crítico.
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentEntity.name, schema: DocumentSchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // El directorio debe existir. UPLOAD_LOCATION se crea arriba.
          cb(null, UPLOAD_LOCATION);
        },
        filename: (req, file, cb) => {
          const originalName = path.parse(file.originalname).name;
          const extension = path.parse(file.originalname).ext;
          // Crear un nombre de archivo único para evitar colisiones y problemas con caracteres especiales.
          cb(null, `${originalName}-${uuidv4()}${extension}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB (mismo límite que se intentó en ParseFilePipe)
      },
      fileFilter: (req, file, cb) => {
        // Validación básica de tipo de archivo (se puede expandir)
        // TODO: Reemplazar esto con una validación más robusta si el FileTypeValidator de ParseFilePipe sigue dando problemas.
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no permitido.'), false);
        }
      },
    }),
    // Si necesitas el StudentModel aquí (ej. para validaciones en el servicio), impórtalo.
    // MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}

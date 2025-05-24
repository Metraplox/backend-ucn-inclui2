import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { Consent, ConsentSchema } from './schemas/consent.schema';
import {
  DocumentEntity,
  DocumentSchema,
} from '../documents/schemas/document.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Consent.name, schema: ConsentSchema },
      { name: DocumentEntity.name, schema: DocumentSchema }, // Necesario para que ConsentService pueda inyectar DocumentModel
      { name: Student.name, schema: StudentSchema }, // Necesario para que ConsentService pueda inyectar StudentModel
    ]),
    // Si DocumentsModule exporta DocumentService y StudentsModule exporta StudentService,
    // y ConsentService los necesitara directamente (en lugar de los modelos),
    // entonces se importarían esos módulos aquí. Por ahora, inyectamos los modelos directamente.
  ],
  controllers: [ConsentController],
  providers: [ConsentService],
})
export class ConsentModule {}

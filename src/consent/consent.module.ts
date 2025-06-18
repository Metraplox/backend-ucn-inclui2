import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { Consent, ConsentSchema } from './schemas/consent.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Consent.name, schema: ConsentSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService], // Exportar para uso en otros módulos
})
export class ConsentModule {}

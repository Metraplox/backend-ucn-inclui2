import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareersService } from './careers.service';
import { CareersServiceExtension } from './careers.service.extension';
import { CareersController } from './controllers/careers.controller';
import { CareerStudentsController } from './controllers/career-students.controller';
import { Career, CareerSchema } from './schemas/career.schema';
import { CareerHeadsController } from './controllers/career-heads.controller';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Career.name, schema: CareerSchema }]),
  ],
  providers: [CareersService, CareersServiceExtension],
  controllers: [CareersController, CareerStudentsController,CareerHeadsController],
  exports: [CareersService, CareersServiceExtension],
})
export class CareersModule {}

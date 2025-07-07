import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesServiceExtension } from './courses.service.extension';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import {
  Adjustment,
  AdjustmentSchema,
} from '../adjustments/schemas/adjustment.schema';
import {
  AcademicHistory,
  AcademicHistorySchema,
} from './schemas/academic-history.schema';
import { AcademicHistoryController } from './controllers/academic-history.controller';
import { AcademicHistoryService } from './services/academic-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Adjustment.name, schema: AdjustmentSchema },
      { name: AcademicHistory.name, schema: AcademicHistorySchema },
    ]),
  ],
  controllers: [CoursesController, AcademicHistoryController],
  providers: [CoursesService, CoursesServiceExtension, AcademicHistoryService],
  exports: [CoursesService, CoursesServiceExtension, AcademicHistoryService],
})
export class CoursesModule {}

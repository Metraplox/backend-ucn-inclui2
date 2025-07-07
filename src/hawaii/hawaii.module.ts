import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { HawaiiService, HawaiiSyncService, HawaiiSyncController } from './';
import { HawaiiCacheService } from './hawaii-cache.service';
import { HawaiiCacheController } from './hawaii-cache.controller';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/schemas/enrollment.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [HawaiiSyncController, HawaiiCacheController],
  providers: [HawaiiService, HawaiiSyncService, HawaiiCacheService],
  exports: [HawaiiService, HawaiiSyncService, HawaiiCacheService],
})
export class HawaiiModule {}

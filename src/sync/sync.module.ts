import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncLog, SyncLogSchema } from './schemas/sync-log.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SyncLog.name, schema: SyncLogSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncLog, SyncLogSchema } from './schemas/sync-log.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { CareersModule } from '../careers/careers.module';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SyncLog.name, schema: SyncLogSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CareersModule,
    UsersModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}

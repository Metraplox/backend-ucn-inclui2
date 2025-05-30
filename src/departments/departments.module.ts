import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentsService } from './departments.service';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { HeadsController } from './controllers/heads.controller';
import { DepartmentHeadsController } from './controllers/department-heads.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { AdjustmentsModule } from '../adjustments/adjustments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StudentsModule } from '../students/students.module';
import { DepartmentStatsService } from './services/department-stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => StudentsModule),
    CoursesModule,
    forwardRef(() => AdjustmentsModule),
    NotificationsModule,
  ],
  controllers: [HeadsController, DepartmentsController, DepartmentHeadsController],
  providers: [DepartmentsService, DepartmentStatsService],
  exports: [DepartmentsService, DepartmentStatsService],
})
export class DepartmentsModule {}

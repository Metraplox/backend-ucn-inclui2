import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentsService } from './departments.service';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { HeadsController } from './controllers/heads.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { AdjustmentsModule } from '../adjustments/adjustments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
    ]),
    forwardRef(() => UsersModule),
    CoursesModule,
    forwardRef(() => AdjustmentsModule),
    NotificationsModule,
  ],
  controllers: [HeadsController, DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}

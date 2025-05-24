import { Module } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { AdjustmentsController } from './adjustments.controller';
import { TeacherAdjustmentsController } from './controllers/teacher-adjustments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Adjustment, AdjustmentSchema } from './schemas/adjustment.schema';
import {
  DocumentEntity,
  DocumentSchema,
} from '../documents/schemas/document.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Adjustment.name, schema: AdjustmentSchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    NotificationsModule,
    CoursesModule,
    UsersModule,
  ],
  controllers: [AdjustmentsController, TeacherAdjustmentsController],
  providers: [AdjustmentsService],
  exports: [AdjustmentsService],
})
export class AdjustmentsModule {}

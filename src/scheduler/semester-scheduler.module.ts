import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { SemesterSchedulerService } from './semester-scheduler.service';
import { SemesterSyncController } from './semester-sync.controller';
import { ComplianceSchedulerService } from './compliance-scheduler.service';
import { SyncModule } from '../sync/sync.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AdjustmentsModule } from '../adjustments/adjustments.module';
import {
  Adjustment,
  AdjustmentSchema,
} from '../adjustments/schemas/adjustment.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Adjustment.name, schema: AdjustmentSchema },
    ]),
    SyncModule,
    NotificationsModule,
    UsersModule,
    AdjustmentsModule,
  ],
  providers: [SemesterSchedulerService, ComplianceSchedulerService],
  controllers: [SemesterSyncController],
  exports: [SemesterSchedulerService, ComplianceSchedulerService],
})
export class SemesterSchedulerModule {}

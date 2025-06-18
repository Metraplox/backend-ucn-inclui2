import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SemesterSchedulerService } from './semester-scheduler.service';
import { SemesterSyncController } from './semester-sync.controller';
import { SyncModule } from '../sync/sync.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SyncModule,
    NotificationsModule,
  ],
  providers: [SemesterSchedulerService],
  controllers: [SemesterSyncController],
  exports: [SemesterSchedulerService],
})
export class SemesterSchedulerModule {} 
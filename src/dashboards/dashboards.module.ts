import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentsModule],
  controllers: [DashboardsController],
})
export class DashboardsModule {}

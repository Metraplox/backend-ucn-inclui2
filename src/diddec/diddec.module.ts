import { Module } from '@nestjs/common';
import { DiddecController } from './diddec.controller';
import { DiddecService } from './diddec.service';
import { DiddecReportsController } from './controllers/diddec-reports.controller';
import { ExportService } from './services/export.service';
import { StudentsModule } from '../students/students.module';
import { AdjustmentsModule } from '../adjustments/adjustments.module';
import { CoursesModule } from '../courses/courses.module';
import { CareersModule } from '../careers/careers.module';
import { ResourcesModule } from '../resources/resources.module';
import { DiddecResourcesController } from './controllers/diddec-resources.controller';

// Esta línea es solo para verificar que TypeScript reconozca los tipos
type VerifyImports = {
  controller: typeof DiddecController;
  service: typeof DiddecService;
  reportsController: typeof DiddecReportsController;
  exportService: typeof ExportService;
  resourcesController: typeof DiddecResourcesController;
};

@Module({
  imports: [
    StudentsModule,
    AdjustmentsModule,
    CoursesModule,
    CareersModule,
    ResourcesModule,
  ],
  controllers: [
    DiddecController,
    DiddecReportsController,
    DiddecResourcesController,
  ],
  providers: [DiddecService, ExportService],
  exports: [DiddecService, ExportService],
})
export class DiddecModule {}

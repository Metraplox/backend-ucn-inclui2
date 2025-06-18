import { Module, forwardRef } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { AdjustmentsServiceExtension } from './adjustments.service.extension';
import { AdjustmentsController } from './adjustments.controller';
// import { TeacherAdjustmentsController } from './controllers/teacher-adjustments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Adjustment, AdjustmentSchema } from './schemas/adjustment.schema';
import {
  DocumentEntity,
  DocumentSchema,
} from '../documents/schemas/document.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';

// Servicios especializados refactorizados
import { AdjustmentCrudService } from './services/adjustment-crud.service';
import { AdjustmentQueryService } from './services/adjustment-query.service';
import { AdjustmentWorkflowService } from './services/adjustment-workflow.service';
import { AdjustmentStatsService } from './services/adjustment-stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Adjustment.name, schema: AdjustmentSchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    NotificationsModule,
    CoursesModule,
    forwardRef(() => UsersModule),
    forwardRef(() => StudentsModule),
  ],
  controllers: [AdjustmentsController], // TeacherAdjustmentsController
  providers: [
    // Servicios principales existentes
    AdjustmentsService,
    AdjustmentsServiceExtension,
    
    // Servicios especializados refactorizados ✅
    AdjustmentCrudService,
    AdjustmentQueryService,
    AdjustmentWorkflowService,
    AdjustmentStatsService,
  ],
  exports: [
    // Servicios principales
    AdjustmentsService,
    AdjustmentsServiceExtension,
    
    // Servicios especializados para uso en otros módulos
    AdjustmentCrudService,
    AdjustmentQueryService,
    AdjustmentWorkflowService,
    AdjustmentStatsService,
  ],
})
export class AdjustmentsModule {}

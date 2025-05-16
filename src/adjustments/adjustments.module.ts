import { Module } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { AdjustmentsController } from './adjustments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Adjustment, AdjustmentSchema } from './schemas/adjustment.schema';
import { DocumentEntity, DocumentSchema } from '../documents/schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Adjustment.name, schema: AdjustmentSchema },
      { name: DocumentEntity.name, schema: DocumentSchema }
    ]),
  ],
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService],
})
export class AdjustmentsModule {}

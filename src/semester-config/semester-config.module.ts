import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SemesterConfig,
  SemesterConfigSchema,
} from './schemas/semester-config.schema';
import { SemesterConfigController } from './semester-config.controller';
import { SemesterConfigService } from './semester-config.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SemesterConfig.name, schema: SemesterConfigSchema },
    ]),
  ],
  controllers: [SemesterConfigController],
  providers: [SemesterConfigService],
  exports: [SemesterConfigService],
})
export class SemesterConfigModule {}

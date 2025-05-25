import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareersService } from './careers.service';
import { Career, CareerSchema } from './schemas/career.schema';
import { UsersModule } from '../users/users.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Career.name, schema: CareerSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => DepartmentsModule),
  ],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}

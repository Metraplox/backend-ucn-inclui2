import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UserResponsibilitiesService } from './services/user-responsibilities.service';
import { DIDDECController } from './controllers/diddec.controller';
import { StudentsModule } from '../students/students.module';
import { AdjustmentsModule } from '../adjustments/adjustments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DepartmentsModule } from '../departments/departments.module';
import { CareersModule } from '../careers/careers.module';
import { DatabaseSeederService } from '../database/database-seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => StudentsModule),
    forwardRef(() => AdjustmentsModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => DepartmentsModule),
    forwardRef(() => CareersModule),
  ],
  controllers: [UsersController, DIDDECController],
  providers: [UsersService, UserResponsibilitiesService, DatabaseSeederService],
  exports: [UsersService, UserResponsibilitiesService], // Exportar ambos servicios
})
export class UsersModule {}

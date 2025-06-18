import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CareersModule } from './careers/careers.module';
import { CoursesModule } from './courses/courses.module';
import { DepartmentsModule } from './departments/departments.module';
import { CategoriesModule } from './categories/categories.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { DocumentsModule } from './documents/documents.module';
import { ResourcesModule } from './resources/resources.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SyncModule } from './sync/sync.module';
import { HawaiiModule } from './hawaii/hawaii.module';
import { DiddecModule } from './diddec/diddec.module';
import { ConsentModule } from './consent/consent.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SemesterSchedulerModule } from './scheduler/semester-scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ucn_inclui2',
    ),
    UsersModule,
    AuthModule,
    StudentsModule,
    CareersModule,
    CoursesModule,
    DepartmentsModule,
    CategoriesModule,
    AdjustmentsModule,
    DocumentsModule,
    ResourcesModule,
    NotificationsModule,
    SyncModule,
    HawaiiModule,
    DiddecModule,
    ConsentModule,
    EnrollmentsModule,
    SemesterSchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}

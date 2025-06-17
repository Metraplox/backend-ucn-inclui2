import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { CareersModule } from './careers/careers.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { DocumentsModule } from './documents/documents.module';
import { CoursesModule } from './courses/courses.module';
import { DepartmentsModule } from './departments/departments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiddecModule } from './diddec/diddec.module';
import { ConsentModule } from './consent/consent.module';
import { ResourcesModule } from './resources/resources.module';
import { HawaiiModule } from './hawaii/hawaii.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SyncModule } from './sync/sync.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000,
          retryWrites: true,
          retryReads: true,
          maxPoolSize: 10,
        };
      },
      inject: [ConfigService],
    }),
    StudentsModule,
    AdjustmentsModule,
    DocumentsModule,
    ConsentModule,
    HawaiiModule,
    EnrollmentsModule,
    CoursesModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
    DepartmentsModule,
    CareersModule,
    DiddecModule,
    ResourcesModule,
    SyncModule,
    CategoriesModule,
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

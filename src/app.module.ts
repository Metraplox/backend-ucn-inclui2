import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { DocumentsModule } from './documents/documents.module';
import { ConsentModule } from './consent/consent.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DepartmentsModule } from './departments/departments.module';
import { CareersModule } from './careers/careers.module';

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
    CoursesModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
    DepartmentsModule,
    CareersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  private async seedUsers() {
    try {
      const userCount = await this.userModel.countDocuments();
      if (userCount > 0) {
        console.log('✅ Database already seeded');
        return;
      }

      const defaultPassword = await bcrypt.hash('password123', 10);
      
      const users = [
        {
          email: 'coordinador@ucn.cl',
          nombreCompleto: 'Ana López Coordinadora',
          password_hash: defaultPassword,
          roles: ['COORDINADOR'],
          isActive: true
        },
        {
          email: 'estudiante1@ucn.cl',
          nombreCompleto: 'Juan Pérez Estudiante',
          password_hash: defaultPassword,
          roles: ['ESTUDIANTE'],
          isActive: true
        },
        {
          email: 'docente@ucn.cl',
          nombreCompleto: 'María González Docente',
          password_hash: defaultPassword,
          roles: ['DOCENTE'],
          isActive: true
        },
        {
          email: 'diddec@ucn.cl',
          nombreCompleto: 'Carlos Martínez DIDDEC',
          password_hash: defaultPassword,
          roles: ['DIDDEC_STAFF'],
          isActive: true
        },
        {
          email: 'educadora@ucn.cl',
          nombreCompleto: 'Laura Silva Educadora',
          password_hash: defaultPassword,
          roles: ['EDUCADORA_SOCIAL'],
          isActive: true
        },
        {
          email: 'jefe.carrera@ucn.cl',
          nombreCompleto: 'Roberto Hernández Jefe Carrera',
          password_hash: defaultPassword,
          roles: ['JEFE_CARRERA'],
          isActive: true
        },
        {
          email: 'jefe.departamento@ucn.cl',
          nombreCompleto: 'Patricia Morales Jefe Departamento',
          password_hash: defaultPassword,
          roles: ['JEFE_DEPARTAMENTO'],
          isActive: true
        }
      ];

      await this.userModel.insertMany(users);
      console.log('✅ Database seeded with test users');
    } catch (error) {
      console.log('⚠️ Database seeding skipped or failed:', error.message);
    }
  }
}

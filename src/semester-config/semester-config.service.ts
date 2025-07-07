import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SemesterConfig,
  SemesterConfigDocument,
} from './schemas/semester-config.schema';

@Injectable()
export class SemesterConfigService {
  constructor(
    @InjectModel(SemesterConfig.name)
    private semesterConfigModel: Model<SemesterConfigDocument>,
  ) {}

  // Lógica del servicio irá aquí (CRUD)
  // ej: async create(createDto: ...): Promise<SemesterConfig>
}

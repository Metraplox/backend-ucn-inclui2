import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Career, CareerDocument } from './schemas/career.schema';

@Injectable()
export class CareersServiceExtension {
  constructor(
    @InjectModel(Career.name)
    private careerModel: Model<CareerDocument>,
  ) {}

  /**
   * Cuenta el número total de carreras para un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Cantidad de carreras en el semestre
   */
  async countCareers(semester: string): Promise<number> {
    const query: any = {};

    if (semester) {
      query.semester = semester;
    }

    return this.careerModel.countDocuments(query).exec();
  }

  /**
   * Obtiene estadísticas de estudiantes con NEE por carrera
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Estadísticas por carrera
   */
  async getCareerStatistics(semester: string): Promise<any[]> {
    const pipeline: PipelineStage[] = [];

    // Match por semestre si se proporciona
    if (semester) {
      pipeline.push({ $match: { semester } });
    }

    // Lookup para obtener estudiantes
    pipeline.push({
      $lookup: {
        from: 'students',
        localField: 'studentIds',
        foreignField: '_id',
        as: 'students',
      },
    });

    // Añadir campos calculados
    pipeline.push({
      $addFields: {
        totalStudents: { $size: '$students' },
        studentsWithNEE: {
          $size: {
            $filter: {
              input: '$students',
              as: 'student',
              cond: { $eq: ['$$student.hasSpecialNeeds', true] },
            },
          },
        },
      },
    });

    // Calcular porcentaje
    pipeline.push({
      $addFields: {
        percentageWithNEE: {
          $cond: [
            { $eq: ['$totalStudents', 0] },
            0,
            {
              $multiply: [
                { $divide: ['$studentsWithNEE', '$totalStudents'] },
                100,
              ],
            },
          ],
        },
      },
    });

    // Proyectar campos necesarios
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        department: 1,
        semester: 1,
        totalStudents: 1,
        studentsWithNEE: 1,
        percentageWithNEE: { $round: ['$percentageWithNEE', 2] },
      },
    });

    // Ordenar por porcentaje descendente
    pipeline.push({
      $sort: { percentageWithNEE: -1 as -1 },
    });

    return this.careerModel.aggregate(pipeline).exec();
  }
}

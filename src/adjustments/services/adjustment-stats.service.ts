import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Adjustment, AdjustmentDocument } from '../schemas/adjustment.schema';

@Injectable()
export class AdjustmentStatsService {
  private readonly logger = new Logger(AdjustmentStatsService.name);

  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
  ) {}

  /**
   * 📊 Contar ajustes confirmados/reconocidos por semestre
   */
  async countAcknowledgedAdjustments(semester: string): Promise<number> {
    const count = await this.adjustmentModel
      .countDocuments({
        semester: semester,
        $or: [
          { 'currentAdjustments.readBy': { $exists: true, $ne: [] } },
          { 'currentAdjustments.estado': 'ACTIVE' },
          { 'currentAdjustments.estado': 'COMPLETED' },
        ],
      })
      .exec();

    this.logger.log(`📈 Ajustes confirmados en semestre ${semester}: ${count}`);

    return count;
  }

  /**
   * ⏳ Contar ajustes pendientes por semestre
   */
  async countPendingAdjustments(semester: string): Promise<number> {
    const count = await this.adjustmentModel
      .countDocuments({
        semester: semester,
        'currentAdjustments.estado': 'PENDING',
        'currentAdjustments.readBy': { $exists: false },
      })
      .exec();

    this.logger.log(`⏳ Ajustes pendientes en semestre ${semester}: ${count}`);

    return count;
  }

  /**
   * 🏢 Contar ajustes por departamento y semestre
   */
  async countAdjustmentsByDepartment(
    departmentName: string,
    semester: string,
  ): Promise<number> {
    const count = await this.adjustmentModel
      .aggregate([
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'careers',
            localField: 'student.careerId',
            foreignField: '_id',
            as: 'career',
          },
        },
        { $unwind: '$career' },
        {
          $match: {
            'career.department': departmentName,
            semester: semester,
          },
        },
        { $count: 'total' },
      ])
      .exec();

    const result = count.length > 0 ? count[0].total : 0;

    this.logger.log(
      `🏢 Ajustes en departamento ${departmentName}, semestre ${semester}: ${result}`,
    );

    return result;
  }

  /**
   * ✅ Contar ajustes confirmados por departamento y semestre
   */
  async countAcknowledgedAdjustmentsByDepartment(
    departmentName: string,
    semester: string,
  ): Promise<number> {
    const count = await this.adjustmentModel
      .aggregate([
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'careers',
            localField: 'student.careerId',
            foreignField: '_id',
            as: 'career',
          },
        },
        { $unwind: '$career' },
        {
          $match: {
            'career.department': departmentName,
            semester: semester,
            $or: [
              { 'currentAdjustments.readBy': { $exists: true, $ne: [] } },
              { 'currentAdjustments.estado': 'ACTIVE' },
              { 'currentAdjustments.estado': 'COMPLETED' },
            ],
          },
        },
        { $count: 'total' },
      ])
      .exec();

    const result = count.length > 0 ? count[0].total : 0;

    this.logger.log(
      `✅ Ajustes confirmados en departamento ${departmentName}, semestre ${semester}: ${result}`,
    );

    return result;
  }

  /**
   * 📊 Contar total de ajustes por semestre
   */
  async countAdjustments(semester: string): Promise<number> {
    const count = await this.adjustmentModel
      .countDocuments({
        semester: semester,
      })
      .exec();

    this.logger.log(`📊 Total ajustes en semestre ${semester}: ${count}`);

    return count;
  }

  /**
   * 📋 Obtener conteo de ajustes por tipo y semestre
   */
  async getAdjustmentCountByType(semester: string): Promise<any[]> {
    const result = await this.adjustmentModel
      .aggregate([
        { $match: { semester: semester } },
        { $unwind: '$currentAdjustments' },
        {
          $lookup: {
            from: 'categories',
            localField: 'currentAdjustments.type',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category.name',
            count: { $sum: 1 },
            categoryId: { $first: '$category._id' },
          },
        },
        {
          $project: {
            _id: 0,
            categoryName: '$_id',
            categoryId: 1,
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ])
      .exec();

    this.logger.log(
      `📋 Estadísticas por tipo para semestre ${semester}: ${result.length} categorías`,
    );

    return result;
  }

  /**
   * 📈 Obtener estadísticas generales de un semestre
   */
  async getSemesterStats(semester: string): Promise<{
    total: number;
    acknowledged: number;
    pending: number;
    byType: any[];
    acknowledgedPercentage: number;
  }> {
    const [total, acknowledged, pending, byType] = await Promise.all([
      this.countAdjustments(semester),
      this.countAcknowledgedAdjustments(semester),
      this.countPendingAdjustments(semester),
      this.getAdjustmentCountByType(semester),
    ]);

    const acknowledgedPercentage = total > 0 ? (acknowledged / total) * 100 : 0;

    this.logger.log(
      `📈 Estadísticas completas generadas para semestre ${semester}`,
    );

    return {
      total,
      acknowledged,
      pending,
      byType,
      acknowledgedPercentage: Math.round(acknowledgedPercentage * 100) / 100,
    };
  }

  /**
   * 🏢 Obtener estadísticas por departamento
   */
  async getDepartmentStats(
    departmentName: string,
    semester: string,
  ): Promise<{
    departmentName: string;
    semester: string;
    total: number;
    acknowledged: number;
    acknowledgedPercentage: number;
  }> {
    const [total, acknowledged] = await Promise.all([
      this.countAdjustmentsByDepartment(departmentName, semester),
      this.countAcknowledgedAdjustmentsByDepartment(departmentName, semester),
    ]);

    const acknowledgedPercentage = total > 0 ? (acknowledged / total) * 100 : 0;

    this.logger.log(
      `🏢 Estadísticas departamentales generadas: ${departmentName}`,
    );

    return {
      departmentName,
      semester,
      total,
      acknowledged,
      acknowledgedPercentage: Math.round(acknowledgedPercentage * 100) / 100,
    };
  }

  /**
   * 🎯 Obtener métricas avanzadas de rendimiento
   */
  async getAdvancedMetrics(semester: string): Promise<{
    averageResponseTime: number;
    mostActiveTeachers: any[];
    adjustmentTrends: any[];
    departmentComparison: any[];
  }> {
    // Simulación de métricas avanzadas - en producción conectar con logs reales
    const averageResponseTime =
      await this.calculateAverageResponseTime(semester);
    const mostActiveTeachers = await this.getMostActiveTeachers(semester);
    const adjustmentTrends = await this.getAdjustmentTrends(semester);
    const departmentComparison = await this.getDepartmentComparison(semester);

    this.logger.log(
      `🎯 Métricas avanzadas calculadas para semestre ${semester}`,
    );

    return {
      averageResponseTime,
      mostActiveTeachers,
      adjustmentTrends,
      departmentComparison,
    };
  }

  /**
   * ⏱️ Calcular tiempo promedio de respuesta (simulado)
   */
  private async calculateAverageResponseTime(
    semester: string,
  ): Promise<number> {
    // En producción, calcular desde timestamps de lectura/confirmación
    const adjustments = await this.adjustmentModel
      .find({
        semester,
        'currentAdjustments.readBy': { $exists: true, $ne: [] },
      })
      .select('createdAt currentAdjustments.readBy')
      .exec();

    if (adjustments.length === 0) return 0;

    // Simulación: promedio de 2-5 días
    const avgHours = 72; // 3 días promedio
    return avgHours;
  }

  /**
   * 👨‍🏫 Obtener profesores más activos
   */
  private async getMostActiveTeachers(semester: string): Promise<any[]> {
    const result = await this.adjustmentModel
      .aggregate([
        { $match: { semester } },
        { $unwind: '$currentAdjustments' },
        { $unwind: '$currentAdjustments.readBy' },
        {
          $lookup: {
            from: 'users',
            localField: 'currentAdjustments.readBy.userId',
            foreignField: '_id',
            as: 'teacher',
          },
        },
        { $unwind: '$teacher' },
        {
          $group: {
            _id: '$teacher._id',
            teacherName: { $first: '$teacher.name' },
            email: { $first: '$teacher.email' },
            interactionsCount: { $sum: 1 },
          },
        },
        { $sort: { interactionsCount: -1 } },
        { $limit: 10 },
      ])
      .exec();

    return result;
  }

  /**
   * 📊 Obtener tendencias de ajustes
   */
  private async getAdjustmentTrends(semester: string): Promise<any[]> {
    const result = await this.adjustmentModel
      .aggregate([
        { $match: { semester } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    return result.map((item) => ({
      date: item._id,
      count: item.count,
    }));
  }

  /**
   * 🏢 Comparación entre departamentos
   */
  private async getDepartmentComparison(semester: string): Promise<any[]> {
    const result = await this.adjustmentModel
      .aggregate([
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'careers',
            localField: 'student.careerId',
            foreignField: '_id',
            as: 'career',
          },
        },
        { $unwind: '$career' },
        { $match: { semester } },
        {
          $group: {
            _id: '$career.department',
            totalAdjustments: { $sum: 1 },
            acknowledgedCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      {
                        $gt: [
                          {
                            $size: {
                              $ifNull: ['$currentAdjustments.readBy', []],
                            },
                          },
                          0,
                        ],
                      },
                      { $eq: ['$currentAdjustments.estado', 'ACTIVE'] },
                      { $eq: ['$currentAdjustments.estado', 'COMPLETED'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            department: '$_id',
            totalAdjustments: 1,
            acknowledgedCount: 1,
            acknowledgedPercentage: {
              $multiply: [
                { $divide: ['$acknowledgedCount', '$totalAdjustments'] },
                100,
              ],
            },
          },
        },
        { $sort: { totalAdjustments: -1 } },
      ])
      .exec();

    return result;
  }
}

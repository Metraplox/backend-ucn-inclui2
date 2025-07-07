import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Adjustment, AdjustmentDocument } from './schemas/adjustment.schema';

@Injectable()
export class AdjustmentsServiceExtension {
  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
  ) {}

  /**
   * Cuenta el número total de ajustes para un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Cantidad de ajustes en el semestre
   */
  async countAdjustments(semester: string): Promise<number> {
    const query: any = {};

    if (semester) {
      query.semester = semester;
    }

    return this.adjustmentModel.countDocuments(query).exec();
  }

  /**
   * Cuenta el número de ajustes que han sido reconocidos por los docentes
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Cantidad de ajustes reconocidos
   */
  async countAcknowledgedAdjustments(semester: string): Promise<number> {
    const pipeline: PipelineStage[] = [];

    // Filtrar por semestre si se proporciona
    if (semester) {
      pipeline.push({ $match: { semester } });
    }

    // Desenrollar los ajustes actuales para contarlos individualmente
    pipeline.push({
      $unwind: {
        path: '$currentAdjustments',
        preserveNullAndEmptyArrays: false,
      },
    });

    // Filtrar solo ajustes que han sido leídos (tienen al menos un elemento en readBy)
    pipeline.push({
      $match: {
        'currentAdjustments.readBy.0': { $exists: true },
      },
    });

    // Contar los resultados
    pipeline.push({
      $count: 'acknowledged',
    });

    const result = await this.adjustmentModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].acknowledged : 0;
  }

  /**
   * Cuenta el número de ajustes pendientes (no reconocidos) por los docentes
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Cantidad de ajustes pendientes
   */
  async countPendingAdjustments(semester: string): Promise<number> {
    const totalAdjustments = await this.countAdjustments(semester);
    const acknowledgedAdjustments =
      await this.countAcknowledgedAdjustments(semester);

    return totalAdjustments - acknowledgedAdjustments;
  }

  /**
   * Obtiene el conteo de ajustes agrupados por tipo
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Array con el conteo de ajustes por tipo
   */
  async getAdjustmentCountByType(semester: string): Promise<any[]> {
    const pipeline: PipelineStage[] = [];

    // Filtrar por semestre si se proporciona
    if (semester) {
      pipeline.push({ $match: { semester } });
    }

    // Desenrollar los ajustes actuales para contarlos individualmente
    pipeline.push({
      $unwind: {
        path: '$currentAdjustments',
        preserveNullAndEmptyArrays: false,
      },
    });

    // Agrupar por tipo de ajuste y contar
    pipeline.push({
      $group: {
        _id: '$currentAdjustments.type',
        count: { $sum: 1 },
      },
    });

    // Formatear la salida
    pipeline.push({
      $project: {
        _id: 0,
        type: '$_id',
        count: 1,
      },
    });

    // Ordenar por cantidad descendente
    pipeline.push({ $sort: { count: -1 } });

    return this.adjustmentModel.aggregate(pipeline).exec();
  }

  /**
   * Cuenta el número de ajustes para un departamento específico
   * @param departmentId ID del departamento
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Número de ajustes en el departamento
   */
  async countAdjustmentsByDepartment(
    departmentId: string,
    semester: string,
  ): Promise<number> {
    const pipeline: PipelineStage[] = [];

    // Match inicial por semestre
    const matchStage: any = {};
    if (semester) {
      matchStage.semester = semester;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Lookup para obtener información del curso
    pipeline.push({
      $lookup: {
        from: 'courses',
        localField: 'currentAdjustments.courseId',
        foreignField: '_id',
        as: 'courseInfo',
      },
    });

    // Filtrar solo cursos del departamento especificado
    pipeline.push({
      $match: {
        'courseInfo.departmentId': new Types.ObjectId(departmentId),
      },
    });

    // Contar los resultados
    pipeline.push({
      $count: 'total',
    });

    const result = await this.adjustmentModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Cuenta el número de ajustes reconocidos para un departamento específico
   * @param departmentId ID del departamento
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Número de ajustes reconocidos en el departamento
   */
  async countAcknowledgedAdjustmentsByDepartment(
    departmentId: string,
    semester: string,
  ): Promise<number> {
    const pipeline: PipelineStage[] = [];

    // Match inicial por semestre
    const matchStage: any = {};
    if (semester) {
      matchStage.semester = semester;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Desenrollar los ajustes actuales
    pipeline.push({
      $unwind: {
        path: '$currentAdjustments',
        preserveNullAndEmptyArrays: false,
      },
    });

    // Filtrar solo ajustes que han sido leídos
    pipeline.push({
      $match: {
        'currentAdjustments.readBy.0': { $exists: true },
      },
    });

    // Lookup para obtener información del curso
    pipeline.push({
      $lookup: {
        from: 'courses',
        localField: 'currentAdjustments.courseId',
        foreignField: '_id',
        as: 'courseInfo',
      },
    });

    // Filtrar solo cursos del departamento especificado
    pipeline.push({
      $match: {
        'courseInfo.departmentId': new Types.ObjectId(departmentId),
      },
    });

    // Contar los resultados
    pipeline.push({
      $count: 'acknowledged',
    });

    const result = await this.adjustmentModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].acknowledged : 0;
  }
}
